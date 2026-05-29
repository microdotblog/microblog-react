import Login from '../../src/stores/Login'
import MicroBlogApi, { APPLE_USERNAME_REQUIRED } from '../../src/api/MicroBlogApi'
import App from '../../src/stores/App'
import { Alert } from 'react-native'

jest.mock('../../src/api/MicroBlogApi', () => ({
  __esModule: true,
  default: {
    login_with_apple: jest.fn()
  },
  APPLE_USERNAME_REQUIRED: 12,
  LOGIN_ERROR: 2,
  LOGIN_INCORRECT: 1,
  LOGIN_SUCCESS: 3,
  LOGIN_TOKEN_INVALID: 4
}))

jest.mock('../../src/stores/Auth', () => ({
  handle_new_login: jest.fn()
}))

const mockGoBack = jest.fn()

jest.mock('../../src/stores/App', () => ({
  close_sheet: jest.fn(),
  navigate_to_screen: jest.fn(),
  navigation: jest.fn(() => ({
    goBack: mockGoBack
  })),
  open_sheet: jest.fn()
}))

describe('Login Apple sign in', () => {
  beforeEach(() => {
    Login.reset()
    MicroBlogApi.login_with_apple.mockReset()
    App.navigate_to_screen.mockReset()
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
})
