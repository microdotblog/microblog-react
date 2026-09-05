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

describe('Micropub interoperability', () => {
  const service = {
    endpoint: 'https://posts.example/micropub?route=publish',
    media_endpoint: 'https://media.example/upload',
    token: 'third-party-token',
    is_microblog: false
  }
  const post_url = 'https://posts.example/entry/1'
  const response = (status = 201, data = {}, location = post_url) => ({
    ok: status >= 200 && status < 300,
    status,
    headers: { get: name => name.toLowerCase() === 'location' ? location : null },
    json: async () => data
  })

  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockResolvedValue(response())
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(require('react-native').Alert, 'alert').mockImplementation(() => {})
  })

  afterEach(() => jest.restoreAllMocks())

  test.each([201, 202])('sends a URL-encoded plain post and uses the Location from HTTP %s', async status => {
    fetch.mockResolvedValue(response(status))
    const result = await MicroPubApi.send_post(service, 'A & B + C', null, [], ['one', 'two'])
    const [url, options] = fetch.mock.calls[0]
    expect(url).toBe(service.endpoint)
    expect(options.headers).toMatchObject({
      Authorization: 'Bearer third-party-token',
      'Content-Type': 'application/x-www-form-urlencoded'
    })
    const params = new URLSearchParams(options.body)
    expect(params.get('content')).toBe('A & B + C')
    expect(params.getAll('category[]')).toEqual(['one', 'two'])
    expect(result).toEqual({ url: post_url })
  })

  test('preserves Markdown when photo alt text requires JSON', async () => {
    await MicroPubApi.send_post({ ...service, destination: 'blog' }, '**Hello**', null, [{
      remote_url: 'https://media.example/photo.jpg', did_upload: true, alt_text: 'A bird'
    }], [], 'published', ['social-a', 'social-b'])
    const options = fetch.mock.calls[0][1]
    expect(options.headers['Content-Type']).toBe('application/json')
    expect(JSON.parse(options.body)).toEqual({
      type: ['h-entry'],
      properties: {
        content: ['**Hello**'],
        photo: [{ value: 'https://media.example/photo.jpg', alt: 'A bird' }],
        'post-status': ['published']
      },
      'mp-destination': 'blog',
      'mp-syndicate-to': ['social-a', 'social-b']
    })
  })

  test('sends inline image Markdown unchanged without duplicating the photo property', async () => {
    await MicroPubApi.send_post(service, '![Bird](https://media.example/bird.jpg)', null, [{
      remote_url: 'https://media.example/bird.jpg', did_upload: true, is_inline: true
    }])
    const options = fetch.mock.calls[0][1]
    expect(options.headers['Content-Type']).toBe('application/x-www-form-urlencoded')
    const params = new URLSearchParams(options.body)
    expect(params.get('content')).toBe('![Bird](https://media.example/bird.jpg)')
    expect(params.has('photo')).toBe(false)
  })

  test('preserves Micro.blog Markdown and keeps photo descriptions aligned', async () => {
    await MicroPubApi.send_post({ ...service, is_microblog: true }, '**Hello**', null, [
      { remote_url: 'https://media.example/1.jpg', did_upload: true },
      { remote_url: 'https://media.example/2.jpg', did_upload: true, alt_text: 'Second photo' }
    ])
    const params = new URLSearchParams(fetch.mock.calls[0][1].body)
    expect(params.get('content')).toBe('**Hello**')
    expect(params.getAll('mp-photo-alt[]')).toEqual(['', 'Second photo'])
  })

  test('uploads local files in the create request when there is no media endpoint', async () => {
    const original_form_data = global.FormData
    global.FormData = require('react-native/Libraries/Network/FormData').default
    try {
      await MicroPubApi.send_post({ ...service, media_endpoint: null }, 'My photo and video', null, [
        { uri: 'file:///tmp/photo.jpg', type: 'image/jpeg', did_upload: false },
        { uri: 'file:///tmp/video.mp4', type: 'video/mp4', is_video: true, did_upload: false }
      ])
      const [url, options] = fetch.mock.calls[0]
      expect(url).toBe(service.endpoint)
      expect(options.headers['Content-Type']).toBeUndefined()
      expect(options.body.getParts()).toEqual(expect.arrayContaining([
        expect.objectContaining({ fieldName: 'photo', uri: 'file:///tmp/photo.jpg', type: 'image/jpeg' }),
        expect.objectContaining({ fieldName: 'video', uri: 'file:///tmp/video.mp4', type: 'video/mp4' })
      ]))
    }
    finally { global.FormData = original_form_data }
  })

  test('uses the selected endpoint for edits and deletes, and removes an empty title', async () => {
    await MicroPubApi.post_update(service, '<p>Hello</p>', post_url, null, [], 'published')
    await MicroPubApi.delete_post(service, post_url)
    await MicroPubApi.publish_draft(service, '<p>Hello</p>', post_url, '')
    expect(fetch.mock.calls.map(([url]) => url)).toEqual([service.endpoint, service.endpoint, service.endpoint])
    const [edit, deletion, draft] = fetch.mock.calls.map(([, options]) => JSON.parse(options.body))
    expect(edit).toMatchObject({ action: 'update', url: post_url, delete: ['name'], replace: { content: ['<p>Hello</p>'] } })
    expect(edit.replace.name).toBeUndefined()
    expect(deletion).toEqual({ action: 'delete', url: post_url })
    expect(draft.replace['post-status']).toEqual(['published'])
    expect(draft.replace.content).toEqual(['<p>Hello</p>'])
  })

  test('does not delete unrelated properties when only content is being edited', async () => {
    await MicroPubApi.post_update(service, 'Reply', post_url)
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ action: 'update', url: post_url, replace: { content: ['Reply'] } })
  })

  test('uses URL encoding for a bookmark and accepts an empty success body', async () => {
    await MicroPubApi.send_entry(service, post_url, 'bookmark-of')
    expect(new URLSearchParams(fetch.mock.calls[0][1].body).get('bookmark-of')).toBe(post_url)
  })

  test.each([400, 404, 405, 501])('accepts unsupported configuration with HTTP %s', async status => {
    fetch.mockResolvedValue(response(status))
    await expect(MicroPubApi.get_config(service)).resolves.toEqual({})
    expect(fetch.mock.calls[0][0]).toBe(`${service.endpoint}&q=config`)
  })

  test('does not mask invalid credentials as empty configuration', async () => {
    fetch.mockResolvedValue(response(401))
    await expect(MicroPubApi.get_config(service)).resolves.toBe(FETCH_ERROR)
  })

  test.each(['network', 'empty HTTP error', 'JSON HTTP error'])('handles %s without throwing', async failure => {
    if (failure === 'network') {
      fetch.mockRejectedValue(new Error('Network request failed'))
    }
    else {
      const result = response(403, { error: 'insufficient_scope' })
      if (failure === 'empty HTTP error') {
        result.json = async () => { throw new Error('Empty body') }
      }
      fetch.mockResolvedValue(result)
    }
    await expect(MicroPubApi.send_post(service, 'Hello')).resolves.toBe(3)
    await expect(MicroPubApi.post_update(service, 'Hello', post_url)).resolves.toBe(3)
    await expect(MicroPubApi.delete_post(service, post_url)).resolves.toBe(7)
    await expect(MicroPubApi.publish_draft(service, 'Hello', post_url, '')).resolves.toBe(7)
    await expect(MicroPubApi.send_entry(service, post_url, 'bookmark-of')).resolves.toBe(3)
  })

  test('preserves authorization endpoint query parameters and requests editing permissions', () => {
    const url = new (require('url').URL)(MicroPubApi.make_auth_url('https://user.example/', 'https://auth.example/?action=authorize'))
    expect(url.searchParams.get('action')).toBe('authorize')
    expect(url.searchParams.get('me')).toBe('https://user.example/')
    expect(url.searchParams.get('scope')).toBe('create update delete')
  })

  test('discovers relative HTTP Link endpoints without requiring HTML', async () => {
    fetch.mockResolvedValue({
      url: 'https://user.example/profile/',
      headers: { get: () => '</micropub>; rel="micropub", </auth>; rel="authorization_endpoint", </token>; rel="token_endpoint"' }
    })
    await expect(MicroPubApi.discover_micropub_endpoints('http://user.example/')).resolves.toEqual({
      micropub: 'https://user.example/micropub', auth: 'https://user.example/auth', token: 'https://user.example/token', is_wordpress: false
    })
  })

  test('combines HTTP and HTML discovery, resolves against the redirected URL, and retains WordPress detection', async () => {
    fetch.mockResolvedValue({
      url: 'https://user.example/profile/',
      headers: { get: () => '</wp-json/micropub>; rel="micropub"' },
      text: async () => '<html><head><link rel="micropub" href="/ignored"/><link rel="authorization_endpoint other" href="auth"/><link rel="token_endpoint" href="../token"/></head></html>'
    })
    await expect(MicroPubApi.discover_micropub_endpoints('http://user.example/')).resolves.toEqual({
      micropub: 'https://user.example/wp-json/micropub', auth: 'https://user.example/profile/auth', token: 'https://user.example/token', is_wordpress: true
    })
  })
})
