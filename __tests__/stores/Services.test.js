import { applySnapshot } from 'mobx-state-tree'
import { Alert, Linking } from 'react-native'
import Services from '../../src/stores/Services'
import MicroPubApi from '../../src/api/MicroPubApi'
import Auth from '../../src/stores/Auth'
import Tokens from '../../src/stores/Tokens'
import XMLRPCApi from '../../src/api/XMLRPCApi'

jest.mock('../../src/stores/Auth', () => ({ user_from_username: jest.fn() }))
jest.mock('../../src/stores/Tokens', () => ({ create_new_service_token: jest.fn() }))
jest.mock('../../src/stores/App', () => ({ now: () => 123 }))
jest.mock('../../src/api/MicroPubApi', () => ({
  __esModule: true,
  default: {
    discover_micropub_endpoints: jest.fn(),
    make_auth_url: jest.fn(() => 'https://example.com/auth'),
    get_config: jest.fn()
  },
  FETCH_ERROR: 2,
  MICROPUB_NOT_FOUND: 8
}))
jest.mock('../../src/api/XMLRPCApi', () => ({
  __esModule: true,
  default: { discover_rsd_endpoint: jest.fn() }
}))

beforeEach(() => {
  applySnapshot(Services, {})
  jest.clearAllMocks()
  jest.spyOn(console, 'log').mockImplementation(() => {})
  jest.spyOn(Alert, 'alert').mockImplementation(() => {})
  jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined)
  MicroPubApi.discover_micropub_endpoints.mockResolvedValue({
    micropub: 'https://example.com/micropub',
    auth: 'https://example.com/auth',
    token: 'https://example.com/token'
  })
})

afterEach(() => jest.restoreAllMocks())

test('rejects a malformed URL without leaving setup loading or starting discovery', async () => {
  await Services.set_url('https://exa mple.com')
  await expect(Services.setup_new_service()).resolves.toBeUndefined()
  expect(Services.is_setting_up).toBe(false)
  expect(Alert.alert).toHaveBeenCalledWith('Invalid URL', 'Please enter a valid URL for your weblog.')
  expect(MicroPubApi.discover_micropub_endpoints).not.toHaveBeenCalled()
  expect(XMLRPCApi.discover_rsd_endpoint).not.toHaveBeenCalled()
})

test('can retry with a corrected URL and preserve its existing query parameters', async () => {
  await Services.set_url('https://exa mple.com')
  await Services.setup_new_service()
  await Services.set_url('example.com/?user=alice')
  await Services.setup_new_service()
  expect(MicroPubApi.discover_micropub_endpoints).toHaveBeenCalledWith('https://example.com/?user=alice&v=123')
  expect(Linking.openURL).toHaveBeenCalledWith('https://example.com/auth')
  expect(Services.micropub_endpoint).toBe('https://example.com/micropub')
  expect(Services.is_setting_up).toBe(false)
})

const token_only = { micropub: 'https://pika.page/micropub', is_wordpress: false }

test('prompts for an app token without attempting IndieAuth or XML-RPC', async () => {
  MicroPubApi.discover_micropub_endpoints.mockResolvedValue(token_only)
  await Services.set_url('https://user.pika.page')
  await Services.setup_new_service()
  expect(Services.show_micropub_token).toBe(true)
  expect(Linking.openURL).not.toHaveBeenCalled()
  expect(XMLRPCApi.discover_rsd_endpoint).not.toHaveBeenCalled()
})

test('rejects an invalid token without saving a service or credentials', async () => {
  MicroPubApi.discover_micropub_endpoints.mockResolvedValue(token_only)
  await Services.set_url('https://user.pika.page')
  await Services.setup_new_service()
  await Services.set_micropub_token('invalid')
  MicroPubApi.get_config.mockResolvedValue(2)
  await Services.setup_with_micropub_token()
  expect(Tokens.create_new_service_token).not.toHaveBeenCalled()
  expect(Auth.user_from_username).not.toHaveBeenCalled()
  expect(Services.did_set_up_successfully).toBe(false)
  expect(Services.checking_credentials).toBe(false)
})

test('validates a token, saves it through the existing credential store, and activates the blog', async () => {
  const config = { 'media-endpoint': 'https://pika.page/micropub/media' }
  const service = { id: 'external', set_initial_config: jest.fn().mockResolvedValue(true) }
  const posting = { create_new_service: jest.fn().mockResolvedValue(service), activate_new_service: jest.fn().mockResolvedValue(true) }
  Auth.user_from_username.mockReturnValue({ posting })
  Tokens.create_new_service_token.mockResolvedValue({})
  MicroPubApi.get_config.mockResolvedValue(config)
  MicroPubApi.discover_micropub_endpoints.mockResolvedValue(token_only)
  await Services.set_url('https://user.pika.page')
  await Services.setup_new_service()
  await Services.set_micropub_token('  test-token  ')
  await Services.setup_with_micropub_token()
  expect(MicroPubApi.get_config).toHaveBeenCalledWith({ endpoint: token_only.micropub, token: 'test-token' })
  expect(Tokens.create_new_service_token).toHaveBeenCalledWith('', 'test-token', 'external')
  expect(service.set_initial_config).toHaveBeenCalledWith(config)
  expect(posting.activate_new_service).toHaveBeenCalledWith(service)
  expect(Services.did_set_up_successfully).toBe(true)
  expect(Services.temp_micropub_token).toBe('')
  expect(Services.show_micropub_token).toBe(false)
})

test('changing the URL clears a pending app token and its prompt', async () => {
  MicroPubApi.discover_micropub_endpoints.mockResolvedValue(token_only)
  await Services.set_url('https://user.pika.page')
  await Services.setup_new_service()
  await Services.set_micropub_token('test-token')
  await Services.set_url('https://another.example')
  expect(Services.show_micropub_token).toBe(false)
  expect(Services.temp_micropub_token).toBe('')
})

test('does not request configuration for an empty token', async () => {
  await Services.set_micropub_token('   ')
  await Services.setup_with_micropub_token()
  expect(MicroPubApi.get_config).not.toHaveBeenCalled()
})

test('clears the loading state if credential storage fails', async () => {
  MicroPubApi.discover_micropub_endpoints.mockResolvedValue(token_only)
  MicroPubApi.get_config.mockResolvedValue({})
  Auth.user_from_username.mockReturnValue({ posting: { create_new_service: jest.fn().mockRejectedValue(new Error('Storage failed')) } })
  await Services.set_url('https://user.pika.page')
  await Services.setup_new_service()
  await Services.set_micropub_token('test-token')
  await Services.setup_with_micropub_token()
  expect(Services.checking_credentials).toBe(false)
  expect(Services.did_set_up_successfully).toBe(false)
  expect(Alert.alert).toHaveBeenCalledWith('Could not connect', 'Could not save your blog settings. Please try again.')
})
