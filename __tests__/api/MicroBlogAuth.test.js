import {
  build_micro_blog_auth_url,
  extract_micro_blog_callback_params,
  extract_signin_token,
  get_micro_blog_redirect_uri,
  is_micro_blog_callback_url,
  is_signin_token_url,
} from '../../src/api/MicroBlogAuth'

describe('MicroBlogAuth helpers', () => {
  test('builds an IndieAuth URL for the Micro.blog app', () => {
    const auth_url = build_micro_blog_auth_url({ state: 'abc123' })

    expect(auth_url).toContain('https://micro.blog/indieauth/auth?')
    expect(auth_url).toContain('client_id=https%3A%2F%2Fmicro.blog%2F')
    expect(auth_url).toContain('response_type=code')
    expect(auth_url).toContain('scope=create')
    expect(auth_url).toContain('state=abc123')
    expect(auth_url).toContain(`redirect_uri=${encodeURIComponent(get_micro_blog_redirect_uri())}`)
  })

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
