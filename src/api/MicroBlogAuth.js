export const MICRO_BLOG_AUTH_URL = 'https://micro.blog/indieauth/auth'
export const MICRO_BLOG_TOKEN_URL = 'https://micro.blog/indieauth/token'
export const MICRO_BLOG_CLIENT_ID = 'https://micro.blog/client.json'
export const MICRO_BLOG_SCOPE = 'read write'
export const MICRO_BLOG_SCHEME = 'microblog'
export const MICRO_BLOG_REDIRECT_URI = `${MICRO_BLOG_SCHEME}://auth/callback`

export function get_micro_blog_redirect_uri() {
  return MICRO_BLOG_REDIRECT_URI
}

export function build_micro_blog_auth_url({
  client_id = MICRO_BLOG_CLIENT_ID,
  redirect_uri = get_micro_blog_redirect_uri(),
  state,
} = {}) {
  const params = new URLSearchParams({
    app: 1,
    client_id,
    redirect_uri,
    response_type: 'code',
    scope: MICRO_BLOG_SCOPE,
    state,
  })

  return `${MICRO_BLOG_AUTH_URL}?${params.toString()}`
}

export function extract_micro_blog_callback_params(raw_url = '') {
  if (!raw_url) {
    return {
      code: '',
      state: '',
    }
  }

  try {
    const parsed_url = new URL(raw_url)

    return {
      code: parsed_url.searchParams.get('code')?.trim() || '',
      state: parsed_url.searchParams.get('state')?.trim() || '',
    }
  }
  catch (error) {
    return {
      code: '',
      state: '',
    }
  }
}

export function extract_signin_token(raw_url = '') {
  if (!raw_url) {
    return ''
  }

  try {
    const parsed_url = new URL(raw_url)

    if (parsed_url.protocol !== `${MICRO_BLOG_SCHEME}:`) {
      return ''
    }

    if (parsed_url.host !== 'signin') {
      return ''
    }

    return parsed_url.pathname.split('/').filter(Boolean).pop()?.trim() || ''
  }
  catch (error) {
    return ''
  }
}

export function is_micro_blog_callback_url(raw_url = '') {
  if (!raw_url) {
    return false
  }

  try {
    const parsed_url = new URL(raw_url)
    const matches_host_callback =
      parsed_url.host === 'auth' && parsed_url.pathname === '/callback'
    const matches_path_callback = parsed_url.pathname === '/auth/callback'

    return parsed_url.protocol === `${MICRO_BLOG_SCHEME}:` &&
      (matches_host_callback || matches_path_callback)
  }
  catch (error) {
    return false
  }
}

export function is_signin_token_url(raw_url = '') {
  return extract_signin_token(raw_url).length > 0
}

export async function exchange_micro_blog_code({
  client_id = MICRO_BLOG_CLIENT_ID,
  code,
  redirect_uri = get_micro_blog_redirect_uri(),
} = {}) {
  const body = new URLSearchParams({
    client_id,
    code,
    grant_type: 'authorization_code',
    redirect_uri,
  })

  const response = await fetch(MICRO_BLOG_TOKEN_URL, {
    body: body.toString(),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok || payload?.error) {
    const error = new Error(
      payload?.error_description || payload?.error || 'Micro.blog token exchange failed.'
    )
    error.status = response.status
    throw error
  }

  return payload
}

export function create_oauth_state() {
  const bytes = new Uint8Array(16)

  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(bytes)
  }
  else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256)
    }
  }

  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}
