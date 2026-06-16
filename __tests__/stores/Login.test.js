import Login from '../../src/stores/Login'
import MicroBlogApi, { APPLE_USERNAME_REQUIRED } from '../../src/api/MicroBlogApi'
import App from '../../src/stores/App'
import Auth from '../../src/stores/Auth'
import { Alert } from 'react-native'

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

  test('bumps web view epoch after successful Apple sign in', async () => {
    MicroBlogApi.login_with_apple.mockResolvedValue({
      username: 'vincent',
      token: 'app-token'
    })
    Auth.handle_new_login.mockResolvedValue(true)

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
    expect(mockGoBack).toHaveBeenCalled()
  })

  test('resets to tabs after successful sign in from a microblog URL', async () => {
    const signin_token = '12345678901234567890'
    MicroBlogApi.login_with_token.mockResolvedValue({
      username: 'vincent',
      token: 'app-token'
    })
    Auth.handle_new_login.mockResolvedValue(true)

    await Login.trigger_login_from_url(`microblog://signin/${signin_token}`)

    expect(MicroBlogApi.login_with_token).toHaveBeenCalledWith(signin_token)
    expect(Auth.handle_new_login).toHaveBeenCalledWith({
      username: 'vincent',
      token: 'app-token'
    })
    expect(App.close_sheet).toHaveBeenCalledWith('main_sheet')
    expect(App.close_sheet).toHaveBeenCalledWith('login-message-sheet')
    expect(App.reset_to_tabs).toHaveBeenCalledTimes(1)
    expect(mockReset).not.toHaveBeenCalled()
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
})
