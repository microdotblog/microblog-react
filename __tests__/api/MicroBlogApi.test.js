import axios from 'axios'

import MicroBlogApi from '../../src/api/MicroBlogApi'

jest.mock('axios', () => ({
  defaults: {},
  post: jest.fn()
}))

jest.mock('../../src/stores/Auth', () => ({
  selected_user: null
}))

describe('MicroBlogApi Apple sign in', () => {
  beforeEach(() => {
    axios.post.mockReset()
  })

  test('posts Apple credentials and returns verified account data', async () => {
    axios.post.mockResolvedValue({
      data: {
        username: 'vincent',
        token: 'app-token'
      }
    })

    const result = await MicroBlogApi.login_with_apple({
      user_id: 'apple-user-id',
      identity_token: 'apple-identity-token',
      email: 'vincent@example.com',
      full_name: 'Vincent Ritter'
    })

    expect(axios.post).toHaveBeenCalledWith(
      '/account/apple',
      expect.any(FormData)
    )
    const form = axios.post.mock.calls[0][1]
    expect(form.get('user_id')).toBe('apple-user-id')
    expect(form.get('identity_token')).toBe('apple-identity-token')
    expect(form.get('email')).toBe('vincent@example.com')
    expect(form.get('full_name')).toBe('Vincent Ritter')
    expect(form.get('app_name')).toBe('Micro.blog for iOS')
    expect(result).toEqual({
      username: 'vincent',
      token: 'app-token'
    })
  })

  test('returns Apple account error responses', async () => {
    axios.post.mockResolvedValue({
      data: {
        error: 'That username is not available.'
      }
    })

    const result = await MicroBlogApi.login_with_apple({
      user_id: 'apple-user-id',
      identity_token: 'apple-identity-token',
      username: 'vincent'
    })

    expect(result).toEqual({
      error: 'That username is not available.'
    })
  })
})
