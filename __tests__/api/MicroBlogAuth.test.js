import {
  build_micro_blog_auth_url,
  exchange_micro_blog_code,
  extract_micro_blog_callback_params,
  extract_signin_token,
  get_micro_blog_redirect_uri,
  is_micro_blog_callback_url,
  is_signin_token_url,
} from '../../src/api/MicroBlogAuth'

describe('MicroBlogAuth helpers', () => {
  const original_fetch = global.fetch

  afterEach(() => {
    global.fetch = original_fetch
  })

  test('builds an IndieAuth URL for the Micro.blog app', () => {
    const auth_url = build_micro_blog_auth_url({ state: 'abc123' })

    expect(auth_url).toContain('https://micro.blog/indieauth/auth?')
    expect(auth_url).toContain('client_id=https%3A%2F%2Fmicro.blog%2Fclient.json')
    expect(auth_url).toContain('app=1')
    expect(auth_url).toContain('response_type=code')
    expect(new URL(auth_url).searchParams.get('scope')).toBe('read write')
    expect(auth_url).toContain('state=abc123')
    expect(auth_url).toContain(`redirect_uri=${encodeURIComponent(get_micro_blog_redirect_uri())}`)
    expect(new URL(auth_url).searchParams.has('code_challenge')).toBe(false)
    expect(new URL(auth_url).searchParams.has('code_challenge_method')).toBe(false)
  })

  test('includes the S256 challenge in the authorization URL', () => {
    const code_challenge = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM'
    const auth_url = build_micro_blog_auth_url({ state: 'abc123', code_challenge })
    const params = new URL(auth_url).searchParams

    expect(params.get('code_challenge')).toBe(code_challenge)
    expect(params.get('code_challenge_method')).toBe('S256')
    expect(params.has('code_verifier')).toBe(false)
  })

  test.each([undefined, 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'])(
    'exchanges the code with the supplied verifier (%s)', async code_verifier => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ access_token: 'access-token' }),
      })

      const result = await exchange_micro_blog_code({ code: 'AUTHCODE', code_verifier })
      const [url, request] = global.fetch.mock.calls[0]
      const body = new URLSearchParams(request.body)

      expect(url).toBe('https://micro.blog/indieauth/token')
      expect(request.method).toBe('POST')
      expect(body.get('code')).toBe('AUTHCODE')
      expect(body.get('redirect_uri')).toBe(get_micro_blog_redirect_uri())
      expect(body.get('code_verifier')).toBe(code_verifier || null)
      expect(body.has('code_challenge')).toBe(false)
      expect(result.access_token).toBe('access-token')
    }
  )

  test('detects and parses Micro.blog OAuth callbacks', () => {
    const callback_url = 'microblog://auth/callback?code=CODE123&state=STATE456'

    expect(is_micro_blog_callback_url(callback_url)).toBe(true)
    expect(extract_micro_blog_callback_params(callback_url)).toEqual({
      code: 'CODE123',
      state: 'STATE456',
    })
  })

  test('detects legacy microblog sign-in token URLs', () => {
    const signin_url = 'microblog://signin/token-value-here'

    expect(is_signin_token_url(signin_url)).toBe(true)
    expect(extract_signin_token(signin_url)).toBe('token-value-here')
    expect(is_micro_blog_callback_url(signin_url)).toBe(false)
  })
})
