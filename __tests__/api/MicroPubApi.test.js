import { URLSearchParams } from 'url'

import MicroPubApi, { FETCH_ERROR, NO_AUTH, AUTH_ERROR, UNSUPPORTED_PKCE } from '../../src/api/MicroPubApi'

jest.mock('axios', () => ({
  post: jest.fn()
}))

jest.mock('../../src/stores/App', () => ({}))

describe('MicroPubApi authorization code exchange', () => {
  const authorization = { token_endpoint: 'https://tokens.example.com/token', state: 'test-state' }
  const token_response = data => ({ ok: true, json: async () => data })

  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockResolvedValue(token_response({ access_token: 'test-access-token' }))
    jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => jest.restoreAllMocks())

  test.each([
    ['abc123', 'abc123'],
    ['abc%2Bdef%2Fghi%3D', 'abc+def/ghi='],
    ['abc%252Fdef', 'abc%2Fdef'],
    ['abc%26x%3Dy', 'abc&x=y'],
    ['abc+def', 'abc def'],
    ['abc%20def', 'abc def'],
    ['abc=', 'abc=']
  ])('preserves the code from callback parameter %s', async (encoded_code, expected_code) => {
    const result = await MicroPubApi.verify_code(authorization, `microblog://indieauth?code=${encoded_code}&state=test-state`)
    expect(result).toEqual({ access_token: 'test-access-token' })
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith(authorization.token_endpoint, {
      method: 'POST', body: expect.any(String),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' }
    })
    expect(Object.fromEntries(new URLSearchParams(fetch.mock.calls[0][1].body))).toEqual({
      client_id: 'https://micro.blog/', code: expected_code,
      redirect_uri: 'https://micro.blog/indieauth/redirect', grant_type: 'authorization_code'
    })
  })

  test('ignores a fragment after the authorization code', async () => {
    await MicroPubApi.verify_code(authorization, 'microblog://indieauth?state=test-state&code=abc123#fragment')
    expect(new URLSearchParams(fetch.mock.calls[0][1].body).get('code')).toBe('abc123')
  })

  test.each([
    'microblog://indieauth?state=test-state',
    'microblog://indieauth?code=&state=test-state',
    'microblog://indieauth?code=abc123',
    'microblog://indieauth?code=abc123&state=wrong',
    'microblog://indieauth?state=test-state#code=fragment-only',
    'microblog://indieauth?code=abc123&state=test-state&error=access_denied',
    'https://example.com/indieauth?code=abc123&state=test-state',
    'microblog://indieauth/other?code=abc123&state=test-state',
    'not-a-url?code=abc123',
    null
  ])('returns NO_AUTH without a request for callback %s', async callback => {
    await expect(MicroPubApi.verify_code(authorization, callback)).resolves.toBe(NO_AUTH)
    expect(fetch).not.toHaveBeenCalled()
  })

  test('includes the original verifier and validates the advertised issuer', async () => {
    const attempt = { ...authorization, issuer: 'https://auth.example/', requires_issuer: true,
      code_challenge: 'original-challenge', code_verifier: 'original-verifier' }
    const data = { access_token: 'test-access-token', me: 'https://user.example/' }
    fetch.mockResolvedValue(token_response(data))
    await expect(MicroPubApi.verify_code(attempt, 'microblog://indieauth?code=abc123&state=test-state&iss=https%3A%2F%2Fauth.example%2F')).resolves.toEqual(data)
    expect(new URLSearchParams(fetch.mock.calls[0][1].body).get('code_verifier')).toBe('original-verifier')
  })

  test.each([null, 'https://wrong.example/', 'https://auth.example'])('rejects a missing or mismatched issuer %p before exchange', async issuer => {
    const params = new URLSearchParams({ code: 'abc123', state: 'test-state' })
    if (issuer) {
      params.set('iss', issuer)
    }
    await expect(MicroPubApi.verify_code({ ...authorization, issuer: 'https://auth.example/', requires_issuer: true }, `microblog://indieauth?${params}`)).resolves.toBe(NO_AUTH)
    expect(fetch).not.toHaveBeenCalled()
  })

  test('accepts an unadvertised issuer only if it matches the metadata', async () => {
    const attempt = { ...authorization, issuer: 'https://auth.example/' }
    await expect(MicroPubApi.verify_code(attempt, 'microblog://indieauth?code=abc123&state=test-state&iss=https%3A%2F%2Fwrong.example%2F')).resolves.toBe(NO_AUTH)
    await expect(MicroPubApi.verify_code(attempt, 'microblog://indieauth?code=abc123&state=test-state&iss=https%3A%2F%2Fauth.example%2F')).resolves.toHaveProperty('access_token')
  })

  test('tolerates an issuer from a legacy server without metadata', async () => {
    await expect(MicroPubApi.verify_code(authorization, 'microblog://indieauth?code=abc123&state=test-state&iss=https%3A%2F%2Flegacy.example%2F')).resolves.toHaveProperty('access_token')
  })

  test('does not send a verifier without an original challenge', async () => {
    await MicroPubApi.verify_code({ ...authorization, code_verifier: 'unused' }, 'microblog://indieauth?code=abc123&state=test-state')
    expect(new URLSearchParams(fetch.mock.calls[0][1].body).has('code_verifier')).toBe(false)
  })

  test('rejects a PKCE attempt that has lost its verifier', async () => {
    await expect(MicroPubApi.verify_code({ ...authorization, code_challenge: 'challenge' }, 'microblog://indieauth?code=abc123&state=test-state')).resolves.toBe(NO_AUTH)
    expect(fetch).not.toHaveBeenCalled()
  })

  test('returns NO_AUTH when the response has no access token', async () => {
    fetch.mockResolvedValue(token_response({}))
    await expect(MicroPubApi.verify_code(authorization, 'microblog://indieauth?code=abc123&state=test-state')).resolves.toBe(NO_AUTH)
  })

  test.each(['network', 'http', 'invalid json'])('returns FETCH_ERROR for a %s error without retrying', async failure => {
    if (failure === 'network') {
      fetch.mockRejectedValue(new Error('Invalid authorization code'))
    }
    else {
      fetch.mockResolvedValue({ ok: failure !== 'http', json: async () => { throw new Error('Invalid JSON') } })
    }
    await expect(MicroPubApi.verify_code(authorization, 'microblog://indieauth?code=abc123&state=test-state')).resolves.toBe(FETCH_ERROR)
    expect(fetch).toHaveBeenCalledTimes(1)
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

  test('preserves an empty syndication array when sending photo alt text as JSON', async () => {
    await MicroPubApi.send_post(service, 'Hello', null, [{
      remote_url: 'https://media.example/photo.jpg', did_upload: true, alt_text: 'A bird'
    }], [], null, [])
    const body = JSON.parse(fetch.mock.calls[0][1].body)
    expect(body['mp-syndicate-to']).toEqual([])
    expect(body.properties.photo).toEqual([{ value: 'https://media.example/photo.jpg', alt: 'A bird' }])
  })

  test.each([[null], [[]], [['social-a']], [['social-a', 'social-b']]])('encodes multipart syndication selection %j', async syndicate_to => {
    const original_form_data = global.FormData
    global.FormData = require('react-native/Libraries/Network/FormData').default
    try {
      await MicroPubApi.send_post({ ...service, media_endpoint: null }, 'Hello', null, [{
        uri: 'file:///tmp/photo.jpg', type: 'image/jpeg', did_upload: false
      }], [], null, syndicate_to)
      const parts = fetch.mock.calls[0][1].body.getParts()
      const syndication_parts = parts.filter(part => part.fieldName.startsWith('mp-syndicate-to'))
      const expected = syndicate_to == null ? [] : syndicate_to.length ? syndicate_to : ['']
      expect(syndication_parts.map(part => ({ name: part.fieldName, value: part.string }))).toEqual(
        expected.map(value => ({ name: 'mp-syndicate-to[]', value }))
      )
    }
    finally {
      global.FormData = original_form_data
    }
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

  test('uses the selected endpoint for edits and deletes, and replaces blank titles with an empty string', async () => {
    await MicroPubApi.post_update(service, '<p>Hello</p>', post_url, null, [], 'published')
    await MicroPubApi.delete_post(service, post_url)
    await MicroPubApi.publish_draft(service, '<p>Hello</p>', post_url, '')
    expect(fetch.mock.calls.map(([url]) => url)).toEqual([service.endpoint, service.endpoint, service.endpoint])
    const [edit, deletion, draft] = fetch.mock.calls.map(([, options]) => JSON.parse(options.body))
    expect(edit).toMatchObject({ action: 'update', url: post_url, replace: { content: ['<p>Hello</p>'], name: [''] } })
    expect(edit.delete).toBeUndefined()
    expect(deletion).toEqual({ action: 'delete', url: post_url })
    expect(draft.replace['post-status']).toEqual(['published'])
    expect(draft.replace.content).toEqual(['<p>Hello</p>'])
    expect(draft.replace.name).toEqual([''])
    expect(draft.delete).toBeUndefined()
  })

  test.each([null, '', 'Updated title'])('replaces the title %p without a delete operation', async title => {
    await MicroPubApi.post_update(service, 'Hello', post_url, title)
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
      action: 'update',
      url: post_url,
      replace: { content: ['Hello'], name: [title === null ? '' : title] }
    })
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
    const url = new (require('url').URL)(MicroPubApi.make_auth_url('https://user.example/', 'https://auth.example/?action=authorize', { state: 'compact-state' }))
    expect(url.searchParams.get('action')).toBe('authorize')
    expect(url.searchParams.get('me')).toBe('https://user.example/')
    expect(url.searchParams.get('scope')).toBe('create update delete')
  })

  test('discovers relative HTTP Link endpoints without requiring HTML', async () => {
    fetch.mockResolvedValue({
      ok: true, url: 'https://user.example/profile/',
      headers: { get: name => name === 'Link' ? '</micropub>; rel="micropub", </auth>; rel="authorization_endpoint", </token>; rel="token_endpoint"' : 'application/json' }
    })
    await expect(MicroPubApi.discover_micropub_endpoints('http://user.example/')).resolves.toEqual({
      micropub: 'https://user.example/micropub', auth: 'https://user.example/auth', token: 'https://user.example/token', is_wordpress: false, me: 'https://user.example/profile/', issuer: '', requires_issuer: false, supports_pkce: false
    })
  })

  test('combines HTTP and HTML discovery, resolves against the redirected URL, and retains WordPress detection', async () => {
    fetch.mockResolvedValue({
      ok: true, url: 'https://user.example/profile/',
      headers: { get: name => name === 'Link' ? '</wp-json/micropub>; rel="micropub"' : 'text/html' },
      text: async () => '<html><head><link rel="micropub" href="/ignored"/><link rel="authorization_endpoint other" href="auth"/><link rel="token_endpoint" href="../token"/></head></html>'
    })
    await expect(MicroPubApi.discover_micropub_endpoints('http://user.example/')).resolves.toEqual({
      micropub: 'https://user.example/wp-json/micropub', auth: 'https://user.example/profile/auth', token: 'https://user.example/token', is_wordpress: true, me: 'https://user.example/profile/', issuer: '', requires_issuer: false, supports_pkce: false
    })
  })
})


describe('IndieAuth metadata discovery', () => {
  const metadata_url = 'https://auth.example/metadata'
  const metadata = { issuer: 'https://auth.example/', authorization_endpoint: 'https://auth.example/authorize',
    token_endpoint: 'https://auth.example/token', code_challenge_methods_supported: ['S256'], authorization_response_iss_parameter_supported: true }
  const profile = (links, html = '', final_url = 'https://user.example/') => ({
    ok: true, url: final_url, text: async () => `<html><head>${html}</head></html>`,
    headers: { get: name => name === 'Link' ? links : 'text/html' }
  })
  const document = data => ({ ok: true, json: async () => data })

  beforeEach(() => {
    jest.spyOn(global, 'fetch')
    jest.spyOn(console, 'log').mockImplementation(() => {})
  })
  afterEach(() => jest.restoreAllMocks())

  test('discovers metadata-only auth with first HTTP links taking precedence over HTML', async () => {
    fetch.mockResolvedValueOnce(profile(`<${metadata_url}>; rel="indieauth-metadata", <https://ignored.example/>; rel="indieauth-metadata", </micropub>; rel="micropub"`, '<link rel="indieauth-metadata" href="/ignored"/>'))
      .mockResolvedValueOnce(document(metadata))
    await expect(MicroPubApi.discover_micropub_endpoints('https://user.example/')).resolves.toMatchObject({
      micropub: 'https://user.example/micropub', auth: metadata.authorization_endpoint, token: metadata.token_endpoint,
      issuer: metadata.issuer, supports_pkce: true, requires_issuer: true
    })
    expect(fetch.mock.calls[1][0]).toBe(metadata_url)
  })

  test('checks HTML metadata even when headers contain all legacy endpoints', async () => {
    fetch.mockResolvedValueOnce(profile('</micropub>; rel="micropub", </old-auth>; rel="authorization_endpoint", </old-token>; rel="token_endpoint"', '<link rel="indieauth-metadata" href="../metadata"/>', 'https://auth.example/profile/'))
      .mockResolvedValueOnce(document(metadata))
    const result = await MicroPubApi.discover_micropub_endpoints('http://user.example/')
    expect(fetch.mock.calls[1][0]).toBe(metadata_url)
    expect(result.auth).toBe(metadata.authorization_endpoint)
    expect(result.me).toBe('https://auth.example/profile/')
  })

  test('preserves the WordPress exclusion without fetching its authorization metadata', async () => {
    fetch.mockResolvedValueOnce(profile(`<${metadata_url}>; rel="indieauth-metadata", </wp-json/micropub>; rel="micropub", </auth>; rel="authorization_endpoint", </token>; rel="token_endpoint"`))
    await expect(MicroPubApi.discover_micropub_endpoints('https://user.example/')).resolves.toMatchObject({ is_wordpress: true })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  test.each([undefined, []])('allows metadata without advertised PKCE %p', async methods => {
    fetch.mockResolvedValueOnce(profile(`<${metadata_url}>; rel="indieauth-metadata", </micropub>; rel="micropub"`))
      .mockResolvedValueOnce(document({ ...metadata, code_challenge_methods_supported: methods }))
    expect((await MicroPubApi.discover_micropub_endpoints('https://user.example/')).supports_pkce).toBe(false)
  })

  test('reports unsupported methods instead of downgrading', async () => {
    fetch.mockResolvedValueOnce(profile(`<${metadata_url}>; rel="indieauth-metadata", </micropub>; rel="micropub"`))
      .mockResolvedValueOnce(document({ ...metadata, code_challenge_methods_supported: ['plain'] }))
    await expect(MicroPubApi.discover_micropub_endpoints('https://user.example/')).resolves.toBe(UNSUPPORTED_PKCE)
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  test.each(['http', 'invalid json', 'missing endpoints'])('does not fall back to legacy auth after a metadata %s error', async failure => {
    fetch.mockResolvedValueOnce(profile(`<${metadata_url}>; rel="indieauth-metadata", </micropub>; rel="micropub", </auth>; rel="authorization_endpoint", </token>; rel="token_endpoint"`))
      .mockResolvedValueOnce(failure === 'http' ? { ok: false } : failure === 'invalid json' ?
        { ok: true, json: async () => { throw new Error('bad JSON') } } : document({ issuer: metadata.issuer }))
    await expect(MicroPubApi.discover_micropub_endpoints('https://user.example/')).resolves.toBe(AUTH_ERROR)
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  test('reports metadata with a missing token endpoint as an authorization error', async () => {
    fetch.mockResolvedValueOnce(profile(`<${metadata_url}>; rel="indieauth-metadata", </micropub>; rel="micropub"`))
      .mockResolvedValueOnce(document({ ...metadata, token_endpoint: undefined }))
    await expect(MicroPubApi.discover_micropub_endpoints('https://user.example/')).resolves.toBe(AUTH_ERROR)
  })

  test('sends the challenge in authorization only for a PKCE attempt', () => {
    const pkce = new URL(MicroPubApi.make_auth_url('https://user.example/', metadata.authorization_endpoint, { state: 'state', code_challenge: 'challenge' }))
    expect(pkce.searchParams.get('code_challenge')).toBe('challenge')
    expect(pkce.searchParams.get('code_challenge_method')).toBe('S256')
    const legacy = new URL(MicroPubApi.make_auth_url('https://user.example/', metadata.authorization_endpoint, { state: 'state' }))
    expect(legacy.searchParams.has('code_challenge')).toBe(false)
    expect(legacy.searchParams.has('code_challenge_method')).toBe(false)
  })

  test('verifies a changed canonical profile even if that profile has no Micropub link', async () => {
    fetch.mockResolvedValueOnce(profile(`<${metadata_url}>; rel="indieauth-metadata"`))
      .mockResolvedValueOnce(document(metadata))
    await expect(MicroPubApi.verify_profile({ auth_endpoint: metadata.authorization_endpoint, issuer: metadata.issuer }, 'https://canonical.example/')).resolves.toBe(true)
  })

  test('rejects a canonical profile declaring another authorization server', async () => {
    fetch.mockResolvedValueOnce(profile('</auth>; rel="authorization_endpoint"'))
    await expect(MicroPubApi.verify_profile({ auth_endpoint: metadata.authorization_endpoint }, 'https://different.example/')).resolves.toBe(false)
  })

  test.each(['', [], {}, 123])('rejects an invalid returned profile %p', async me => {
    await expect(MicroPubApi.verify_profile({}, me)).resolves.toBe(false)
    expect(fetch).not.toHaveBeenCalled()
  })

  test('accepts the original or redirected profile without rediscovery, and tolerates older OAuth responses', async () => {
    const attempt = { me: 'https://user.example/', profile_url: 'https://user.example/profile/' }
    for (const me of [undefined, attempt.me, attempt.profile_url]) {
      await expect(MicroPubApi.verify_profile(attempt, me)).resolves.toBe(true)
    }
    expect(fetch).not.toHaveBeenCalled()
  })
})
