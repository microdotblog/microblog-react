import { applySnapshot } from 'mobx-state-tree'
import { Alert, Linking } from 'react-native'
import Services from '../../src/stores/Services'
import MicroPubApi from '../../src/api/MicroPubApi'
import XMLRPCApi from '../../src/api/XMLRPCApi'

jest.mock('../../src/stores/Auth', () => ({}))
jest.mock('../../src/stores/Tokens', () => ({}))
jest.mock('../../src/stores/App', () => ({ now: () => 123 }))
jest.mock('../../src/api/MicroPubApi', () => ({
  __esModule: true,
  default: {
    discover_micropub_endpoints: jest.fn(),
    make_auth_url: jest.fn(() => 'https://example.com/auth')
  }
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
