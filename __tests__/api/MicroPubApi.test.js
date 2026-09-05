import axios from 'axios'
import { URLSearchParams } from 'url'

import MicroPubApi, { FETCH_ERROR, NO_AUTH } from '../../src/api/MicroPubApi'

jest.mock('axios', () => ({
  post: jest.fn()
}))

jest.mock('../../src/stores/App', () => ({}))

describe('MicroPubApi authorization code exchange', () => {
  const service = { token_endpoint: 'https://tokens.example.com/token' }

  beforeEach(() => {
    axios.post.mockReset()
    axios.post.mockResolvedValue({ data: { access_token: 'test-access-token' } })
    jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test.each([
    ['abc123', 'abc123'],
    ['abc%2Bdef%2Fghi%3D', 'abc+def/ghi='],
    ['abc%252Fdef', 'abc%2Fdef'],
    ['abc%26x%3Dy', 'abc&x=y'],
    ['abc+def', 'abc def'],
    ['abc%20def', 'abc def'],
    ['abc=', 'abc=']
  ])('preserves the code from callback parameter %s', async (encoded_code, expected_code) => {
    const result = await MicroPubApi.verify_code(
      service,
      `microblog://indieauth?code=${encoded_code}&state=test-state`
    )

    expect(result).toBe('test-access-token')
    expect(axios.post).toHaveBeenCalledTimes(1)
    expect(axios.post).toHaveBeenCalledWith(
      service.token_endpoint,
      expect.any(String),
      { headers: { 'Content-type': 'application/x-www-form-urlencoded', Accept: 'application/json' } }
    )
    const params = new URLSearchParams(axios.post.mock.calls[0][1])
    expect(Object.fromEntries(params)).toEqual({
      client_id: 'https://micro.blog/',
      code: expected_code,
      redirect_uri: 'https://micro.blog/indieauth/redirect',
      grant_type: 'authorization_code'
    })
  })

  test('ignores a fragment after the authorization code', async () => {
    await MicroPubApi.verify_code(service, 'microblog://indieauth?state=test-state&code=abc123#fragment')

    const params = new URLSearchParams(axios.post.mock.calls[0][1])
    expect(params.get('code')).toBe('abc123')
  })

  test.each([
    'microblog://indieauth?state=test-state',
    'microblog://indieauth?code=&state=test-state',
    'microblog://indieauth?state=test-state#code=fragment-only',
    'not-a-url?code=abc123',
    null
  ])('returns NO_AUTH without a request for callback %s', async callback => {
    await expect(MicroPubApi.verify_code(service, callback)).resolves.toBe(NO_AUTH)
    expect(axios.post).not.toHaveBeenCalled()
  })

  test('returns NO_AUTH when the response has no access token', async () => {
    axios.post.mockResolvedValue({ data: {} })

    await expect(MicroPubApi.verify_code(service, 'microblog://indieauth?code=abc123'))
      .resolves.toBe(NO_AUTH)
  })

  test('returns FETCH_ERROR when the token request fails', async () => {
    axios.post.mockRejectedValue(new Error('Invalid authorization code'))

    await expect(MicroPubApi.verify_code(service, 'microblog://indieauth?code=abc123'))
      .resolves.toBe(FETCH_ERROR)
  })
})
