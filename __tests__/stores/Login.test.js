import Login from '../../src/stores/Login'
import MicroBlogApi, { APPLE_USERNAME_REQUIRED } from '../../src/api/MicroBlogApi'
import {
  build_micro_blog_auth_url,
  create_oauth_state,
  exchange_micro_blog_code,
  get_micro_blog_redirect_uri,
} from '../../src/api/MicroBlogAuth'
import App from '../../src/stores/App'
import Auth from '../../src/stores/Auth'
import { Alert } from 'react-native'
import * as WebBrowser from 'expo-web-browser'

jest.mock('../../src/api/MicroBlogApi', () => ({
  __esModule: true,
  default: {
    login_with_apple: jest.fn(),
    login_with_token: jest.fn()
  },
  APPLE_USERNAME_REQUIRED: 12,
  LOGIN_ERROR: 2,
  LOGIN_INCORRECT: 1,
  LOGIN_SUCCESS: 3,
  LOGIN_TOKEN_INVALID: 4
}))

jest.mock('../../src/api/MicroBlogAuth', () => {
  const actual = jest.requireActual('../../src/api/MicroBlogAuth')
  return {
    ...actual,
    build_micro_blog_auth_url: jest.fn(actual.build_micro_blog_auth_url),
    create_oauth_state: jest.fn(() => 'oauth-state'),
    exchange_micro_blog_code: jest.fn(),
    get_micro_blog_redirect_uri: jest.fn(actual.get_micro_blog_redirect_uri),
  }
})

jest.mock('expo-web-browser', () => ({
  openAuthSessionAsync: jest.fn(),
  maybeCompleteAuthSession: jest.fn(),
}))

jest.mock('../../src/stores/Auth', () => ({
  handle_new_login: jest.fn(),
  is_logged_in: jest.fn(() => false),
  is_selecting_user: true,
  selected_user: null,
  users: []
}))

const mockCanGoBack = jest.fn()
const mockGoBack = jest.fn()
const mockNavigate = jest.fn()
const mockReset = jest.fn()

jest.mock('../../src/stores/App', () => ({
  close_sheet: jest.fn(),
  navigate_to_screen: jest.fn(),
  reset_to_tabs: jest.fn(),
  navigation: jest.fn(() => ({
    canGoBack: mockCanGoBack,
    goBack: mockGoBack,
    navigate: mockNavigate,
    reset: mockReset
  })),
  open_sheet: jest.fn(),
  bump_web_view_epoch: jest.fn()
}))

describe('Login Apple sign in', () => {
  beforeEach(() => {
    Login.reset()
    MicroBlogApi.login_with_apple.mockReset()
    MicroBlogApi.login_with_token.mockReset()
    App.navigate_to_screen.mockReset()
    App.reset_to_tabs.mockReset()
    App.bump_web_view_epoch.mockReset()
    App.close_sheet.mockReset()
    mockCanGoBack.mockReset()
    mockGoBack.mockReset()
    mockNavigate.mockReset()
    mockReset.mockReset()
    Auth.handle_new_login.mockReset()
    Auth.is_logged_in.mockReset()
    Auth.is_logged_in.mockReturnValue(false)
    Auth.is_selecting_user = true
    Auth.selected_user = null
    Auth.users = []
    mockCanGoBack.mockReturnValue(true)
    App.reset_to_tabs.mockResolvedValue(true)
    App.bump_web_view_epoch.mockResolvedValue(true)
    App.close_sheet.mockResolvedValue(true)
    WebBrowser.openAuthSessionAsync.mockReset()
    create_oauth_state.mockReset()
    create_oauth_state.mockReturnValue('oauth-state')
    exchange_micro_blog_code.mockReset()
    build_micro_blog_auth_url.mockClear()
    get_micro_blog_redirect_uri.mockClear()
    jest.spyOn(Alert, 'alert').mockImplementation(() => {})
  })

  afterEach(() => {
    Alert.alert.mockRestore()
  })

  test('keeps Apple credentials and opens username screen when a new account needs a username', async () => {
    MicroBlogApi.login_with_apple.mockResolvedValue(APPLE_USERNAME_REQUIRED)

    await Login.login_with_apple_credentials({
      user_id: 'apple-user-id',
      identity_token: 'apple-identity-token',
      email: 'vincent@example.com',
      full_name: 'Vincent Ritter'
    })

    expect(Login.apple_user_id).toBe('apple-user-id')
    expect(Login.apple_identity_token).toBe('apple-identity-token')
    expect(App.navigate_to_screen).toHaveBeenCalledWith('AppleUsername')
    expect(Login.is_loading).toBe(false)
  })

  test('clears stale Apple username when starting a new Apple sign in', async () => {
    MicroBlogApi.login_with_apple.mockResolvedValue(APPLE_USERNAME_REQUIRED)

    await Login.login_with_apple_credentials({
      user_id: 'old-apple-user-id',
      identity_token: 'old-apple-identity-token'
    })
    Login.set_apple_username('oldusername')

    await Login.login_with_apple_credentials({
      user_id: 'new-apple-user-id',
      identity_token: 'new-apple-identity-token'
    })

    expect(Login.apple_user_id).toBe('new-apple-user-id')
    expect(Login.apple_identity_token).toBe('new-apple-identity-token')
    expect(Login.apple_username).toBe('')
  })

  test('does not submit Apple username again while registration is loading', async () => {
    MicroBlogApi.login_with_apple.mockResolvedValueOnce(APPLE_USERNAME_REQUIRED)

    await Login.login_with_apple_credentials({
      user_id: 'apple-user-id',
      identity_token: 'apple-identity-token'
    })
    Login.set_apple_username('vincent')

    let resolve_register
    const register_promise = new Promise(resolve => {
      resolve_register = resolve
    })
    MicroBlogApi.login_with_apple.mockReturnValueOnce(register_promise)

    const first_register = Login.register_apple_username()

    expect(Login.is_loading).toBe(true)
    expect(Login.can_submit_apple_username()).toBe(false)

    const second_register = await Login.register_apple_username()

    expect(second_register).toBe(false)
    expect(MicroBlogApi.login_with_apple).toHaveBeenCalledTimes(2)

    resolve_register({ error: 'That username is not available.' })
    await first_register
  })

  test('can clear Apple sign in scratch state', async () => {
    MicroBlogApi.login_with_apple.mockResolvedValue(APPLE_USERNAME_REQUIRED)

    await Login.login_with_apple_credentials({
      user_id: 'apple-user-id',
      identity_token: 'apple-identity-token',
      email: 'vincent@example.com',
      full_name: 'Vincent Ritter'
    })
    Login.set_apple_username('vincent')

    Login.reset_apple_credentials()

    expect(Login.apple_user_id).toBeNull()
    expect(Login.apple_identity_token).toBeNull()
    expect(Login.apple_email).toBeNull()
    expect(Login.apple_full_name).toBeNull()
    expect(Login.apple_username).toBe('')
  })

  test('shows Apple account error messages returned by Micro.blog', async () => {
    MicroBlogApi.login_with_apple.mockResolvedValue({
      error: 'That username is not available.'
    })

    await Login.login_with_apple_credentials({
      user_id: 'apple-user-id',
      identity_token: 'apple-identity-token'
    })

    expect(Alert.alert).toHaveBeenCalledWith(
      'Unable to sign in with Apple',
      'That username is not available.'
    )
    expect(Login.is_loading).toBe(false)
  })

  test('bumps web view epoch after successful first-time Apple sign in without stack navigation', async () => {
    MicroBlogApi.login_with_apple.mockResolvedValue({
      username: 'vincent',
      token: 'app-token'
    })
    Auth.handle_new_login.mockResolvedValue(true)
    Auth.is_logged_in.mockReturnValue(false)

    await Login.login_with_apple_credentials({
      user_id: 'apple-user-id',
      identity_token: 'apple-identity-token'
    })

    expect(Auth.handle_new_login).toHaveBeenCalledWith({
      username: 'vincent',
      token: 'app-token'
    })
    expect(App.bump_web_view_epoch).toHaveBeenCalledTimes(1)
    expect(App.close_sheet).toHaveBeenCalledWith('main_sheet')
    expect(mockGoBack).not.toHaveBeenCalled()
    expect(App.reset_to_tabs).not.toHaveBeenCalled()
  })

  test('goes back after successful Apple sign in when adding another account', async () => {
    MicroBlogApi.login_with_apple.mockResolvedValue({
      username: 'vincent',
      token: 'app-token'
    })
    Auth.handle_new_login.mockResolvedValue(true)
    Auth.is_logged_in.mockReturnValue(true)

    await Login.login_with_apple_credentials({
      user_id: 'apple-user-id',
      identity_token: 'apple-identity-token'
    })

    expect(App.bump_web_view_epoch).toHaveBeenCalledTimes(1)
    expect(mockGoBack).toHaveBeenCalled()
    expect(App.reset_to_tabs).not.toHaveBeenCalled()
  })

  test('completes first-time sign in from a microblog URL without stack navigation', async () => {
    const signin_token = '12345678901234567890'
    MicroBlogApi.login_with_token.mockResolvedValue({
      username: 'vincent',
      token: 'app-token'
    })
    Auth.handle_new_login.mockResolvedValue(true)
    Auth.is_logged_in.mockReturnValue(false)

    await Login.trigger_login_from_url(`microblog://signin/${signin_token}`)

    expect(MicroBlogApi.login_with_token).toHaveBeenCalledWith(signin_token)
    expect(Auth.handle_new_login).toHaveBeenCalledWith({
      username: 'vincent',
      token: 'app-token'
    })
    expect(App.close_sheet).toHaveBeenCalledWith('main_sheet')
    expect(App.close_sheet).toHaveBeenCalledWith('login-message-sheet')
    expect(App.reset_to_tabs).not.toHaveBeenCalled()
    expect(mockReset).not.toHaveBeenCalled()
    expect(mockGoBack).not.toHaveBeenCalled()
  })

  test('resets to tabs after microblog URL sign in when already signed in', async () => {
    const signin_token = '12345678901234567890'
    MicroBlogApi.login_with_token.mockResolvedValue({
      username: 'vincent',
      token: 'app-token'
    })
    Auth.handle_new_login.mockResolvedValue(true)
    Auth.is_logged_in.mockReturnValue(true)

    await Login.trigger_login_from_url(`microblog://signin/${signin_token}`)

    expect(App.reset_to_tabs).toHaveBeenCalledTimes(1)
    expect(mockGoBack).not.toHaveBeenCalled()
  })

  test('does not copy a microblog URL sign in token into the visible input', async () => {
    const signin_token = '12345678901234567890'
    let resolve_login
    MicroBlogApi.login_with_token.mockReturnValue(new Promise(resolve => {
      resolve_login = resolve
    }))
    Auth.handle_new_login.mockResolvedValue(true)

    const login_promise = Login.trigger_login_from_url(`microblog://signin/${signin_token}`)
    await Promise.resolve()

    expect(Login.is_loading).toBe(true)
    expect(Login.input_value).toBe('')
    expect(MicroBlogApi.login_with_token).toHaveBeenCalledWith(signin_token)

    resolve_login({
      username: 'vincent',
      token: 'app-token'
    })
    await login_promise
  })

  test('signs in with Micro.blog through the IndieAuth browser session', async () => {
    WebBrowser.openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'microblog://auth/callback?code=AUTHCODE&state=oauth-state',
    })
    exchange_micro_blog_code.mockResolvedValue({
      access_token: 'access-token',
    })
    MicroBlogApi.login_with_token.mockResolvedValue({
      username: 'vincent',
      token: 'app-token',
    })
    Auth.handle_new_login.mockResolvedValue(true)

    const did_sign_in = await Login.sign_in_with_micro_blog()

    expect(did_sign_in).toBe(true)
    expect(WebBrowser.openAuthSessionAsync).toHaveBeenCalled()
    expect(exchange_micro_blog_code).toHaveBeenCalledWith({ code: 'AUTHCODE' })
    expect(MicroBlogApi.login_with_token).toHaveBeenCalledWith('access-token')
    expect(Auth.handle_new_login).toHaveBeenCalledWith({
      username: 'vincent',
      token: 'app-token',
    })
    expect(Login.pending_oauth_state).toBeNull()
    expect(Login.is_loading).toBe(false)
  })

  test('clears pending oauth state when the browser session is cancelled', async () => {
    WebBrowser.openAuthSessionAsync.mockResolvedValue({
      type: 'cancel',
    })

    const did_sign_in = await Login.sign_in_with_micro_blog()

    expect(did_sign_in).toBe(false)
    expect(Login.pending_oauth_state).toBeNull()
    expect(Login.show_error).toBe(false)
    expect(exchange_micro_blog_code).not.toHaveBeenCalled()
  })

  test('rejects oauth callbacks with a mismatched state', async () => {
    create_oauth_state.mockReturnValue('expected-state')
    WebBrowser.openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'microblog://auth/callback?code=AUTHCODE&state=other-state',
    })

    const did_sign_in = await Login.sign_in_with_micro_blog()

    expect(did_sign_in).toBe(false)
    expect(Login.error_message).toBe('Micro.blog sign in could not be verified. Please try again.')
    expect(Login.pending_oauth_state).toBeNull()
    expect(exchange_micro_blog_code).not.toHaveBeenCalled()
  })

  test('signs in with a pasted app token', async () => {
    MicroBlogApi.login_with_token.mockResolvedValue({
      username: 'vincent',
      token: 'app-token',
    })
    Auth.handle_new_login.mockResolvedValue(true)

    const did_sign_in = await Login.login_with_token(false, ' pasted-token ')

    expect(did_sign_in).toBe(true)
    expect(MicroBlogApi.login_with_token).toHaveBeenCalledWith('pasted-token')
    expect(Auth.handle_new_login).toHaveBeenCalledWith({
      username: 'vincent',
      token: 'app-token',
    })
  })
})
