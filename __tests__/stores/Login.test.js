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
