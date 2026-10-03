import { applySnapshot } from 'mobx-state-tree'
import { Alert } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import * as WebBrowser from 'expo-web-browser'
import Services from '../../src/stores/Services'
import Auth from '../../src/stores/Auth'
import Tokens from '../../src/stores/Tokens'
import MicroPubApi, { AUTH_ERROR, UNSUPPORTED_PKCE } from '../../src/api/MicroPubApi'
import XMLRPCApi from '../../src/api/XMLRPCApi'
import { createAuthorization } from '../../src/utils/indieauth'

const mockStorage = new Map()
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async key => mockStorage.get(key) || null),
  setItemAsync: jest.fn(async (key, value) => { mockStorage.set(key, value) }),
  deleteItemAsync: jest.fn(async key => { mockStorage.delete(key) })
}))
jest.mock('expo-web-browser', () => ({ openAuthSessionAsync: jest.fn() }))
jest.mock('../../src/utils/indieauth', () => ({ createAuthorization: jest.fn() }))
jest.mock('../../src/stores/Auth', () => ({ selected_user: null, user_from_username: jest.fn() }))
jest.mock('../../src/stores/Tokens', () => ({ create_new_service_token: jest.fn() }))
jest.mock('../../src/stores/App', () => ({ now: () => 123 }))
jest.mock('../../src/api/MicroPubApi', () => ({
  __esModule: true,
  AUTH_ERROR: 9, UNSUPPORTED_PKCE: 10, MICROPUB_NOT_FOUND: 8, FETCH_ERROR: 2, NO_AUTH: 6,
  default: {
    discover_micropub_endpoints: jest.fn(), make_auth_url: jest.fn(), is_auth_callback: jest.fn(),
    verify_code: jest.fn(), verify_profile: jest.fn(), get_config: jest.fn()
  }
}))
jest.mock('../../src/api/XMLRPCApi', () => ({
  __esModule: true,
  default: { discover_rsd_endpoint: jest.fn() }
}))

const endpoints = { micropub: 'https://example.com/micropub', auth: 'https://example.com/auth', token: 'https://example.com/token', supports_pkce: true }
const attempt = () => ({
  state: 'compact-state', code_verifier: 'original-verifier', code_challenge: 'original-challenge',
  me: 'https://example.com/', blog_url: 'example.com', username: 'alice',
  micropub_endpoint: endpoints.micropub, auth_endpoint: endpoints.auth, token_endpoint: endpoints.token,
  expires_at: Date.now() + 600000
})
const callback = 'microblog://indieauth?code=abc123&state=compact-state'
let posting

beforeEach(() => {
  applySnapshot(Services, { current_username: 'alice' })
  mockStorage.clear()
  jest.clearAllMocks()
  jest.spyOn(console, 'log').mockImplementation(() => {})
  jest.spyOn(Alert, 'alert').mockImplementation(() => {})
  WebBrowser.openAuthSessionAsync.mockResolvedValue({ type: 'cancel' })
  MicroPubApi.make_auth_url.mockReturnValue('https://example.com/auth')
  MicroPubApi.is_auth_callback.mockImplementation(url => typeof url === 'string' && url.startsWith('microblog://indieauth?'))
  MicroPubApi.discover_micropub_endpoints.mockResolvedValue(endpoints)
  MicroPubApi.verify_code.mockResolvedValue({ access_token: 'access-token', me: 'https://example.com/' })
  MicroPubApi.verify_profile.mockResolvedValue(true)
  MicroPubApi.get_config.mockResolvedValue({})
  createAuthorization.mockResolvedValue({ state: 'compact-state', code_verifier: 'original-verifier', code_challenge: 'original-challenge' })
  const service = { id: 'service-1', set_initial_config: jest.fn().mockResolvedValue(true) }
  posting = { create_new_service: jest.fn().mockResolvedValue(service), activate_new_service: jest.fn().mockResolvedValue(true) }
  Auth.selected_user = { username: 'alice', posting }
  Auth.user_from_username.mockImplementation(username => username === 'alice' ? Auth.selected_user : null)
  Tokens.create_new_service_token.mockResolvedValue({})
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
  expect(WebBrowser.openAuthSessionAsync).toHaveBeenCalledWith('https://example.com/auth', 'microblog://indieauth')
  expect(Services.micropub_endpoint).toBe(endpoints.micropub)
  expect(Services.is_setting_up).toBe(false)
})

test('stores the original attempt before launching the browser and clears cancellation', async () => {
  WebBrowser.openAuthSessionAsync.mockImplementation(async () => {
    const saved = JSON.parse(mockStorage.get('MicropubAuth'))
    expect(saved).toMatchObject({ ...attempt(), expires_at: expect.any(Number) })
    expect(Services.pending_micropub_auth).toEqual(saved)
    return { type: 'cancel' }
  })
  await Services.set_url('example.com')
  await Services.setup_new_service()
  expect(createAuthorization).toHaveBeenCalledWith(true)
  expect(Services.pending_micropub_auth).toBeNull()
  expect(mockStorage.has('MicropubAuth')).toBe(false)
  expect(MicroPubApi.verify_code).not.toHaveBeenCalled()
})

test('completes an authorization session using the stored endpoints and owning account', async () => {
  WebBrowser.openAuthSessionAsync.mockResolvedValue({ type: 'success', url: callback })
  await Services.set_url('example.com')
  await Services.setup_new_service()
  expect(MicroPubApi.verify_code).toHaveBeenCalledWith(expect.objectContaining({ state: 'compact-state', code_verifier: 'original-verifier', token_endpoint: endpoints.token }), callback)
  expect(Tokens.create_new_service_token).toHaveBeenCalledWith('alice', 'access-token', 'service-1')
  expect(Services.did_set_up_successfully).toBe(true)
  expect(mockStorage.has('MicropubAuth')).toBe(false)
})

test('completes legacy authorization with state and no PKCE fields', async () => {
  MicroPubApi.discover_micropub_endpoints.mockResolvedValue({ ...endpoints, supports_pkce: false })
  createAuthorization.mockResolvedValue({ state: 'compact-state' })
  WebBrowser.openAuthSessionAsync.mockResolvedValue({ type: 'success', url: callback })
  await Services.set_url('example.com')
  await Services.setup_new_service()
  expect(createAuthorization).toHaveBeenCalledWith(false)
  const saved = MicroPubApi.verify_code.mock.calls[0][0]
  expect(saved.state).toBe('compact-state')
  expect(saved.code_challenge).toBeUndefined()
  expect(saved.code_verifier).toBeUndefined()
  expect(Services.did_set_up_successfully).toBe(true)
})

test('resumes a persisted attempt after a cold launch without using mutable setup fields', async () => {
  mockStorage.set('MicropubAuth', JSON.stringify(attempt()))
  applySnapshot(Services, { current_username: 'other', current_url: 'wrong.example', token_endpoint: 'https://wrong.example/token' })
  await expect(Services.check_micropub_credentials_and_proceed_setup(callback)).resolves.toBe(true)
  expect(MicroPubApi.verify_code).toHaveBeenCalledWith(expect.objectContaining({ username: 'alice', token_endpoint: endpoints.token }), callback)
  expect(posting.create_new_service).toHaveBeenCalledWith(expect.anything(), 'example.com', endpoints.micropub, 'alice')
  expect(Services.current_username).toBe('alice')
  expect(Services.current_url).toBe('example.com')
})

test('ignores duplicate callbacks while exchanging and after the attempt is consumed', async () => {
  mockStorage.set('MicropubAuth', JSON.stringify(attempt()))
  let finish_exchange
  MicroPubApi.verify_code.mockImplementation(() => new Promise(resolve => { finish_exchange = resolve }))
  const first = Services.check_micropub_credentials_and_proceed_setup(callback)
  await new Promise(setImmediate)
  await expect(Services.check_micropub_credentials_and_proceed_setup(callback)).resolves.toBe(false)
  expect(mockStorage.has('MicropubAuth')).toBe(false)
  finish_exchange({ access_token: 'access-token' })
  await first
  await expect(Services.check_micropub_credentials_and_proceed_setup(callback)).resolves.toBe(false)
  expect(MicroPubApi.verify_code).toHaveBeenCalledTimes(1)
  expect(posting.create_new_service).toHaveBeenCalledTimes(1)
})

test('rejects wrong state without consuming the valid pending attempt', async () => {
  mockStorage.set('MicropubAuth', JSON.stringify(attempt()))
  await expect(Services.check_micropub_credentials_and_proceed_setup(callback.replace('compact-state', 'wrong-state'))).resolves.toBe(false)
  expect(MicroPubApi.verify_code).not.toHaveBeenCalled()
  expect(mockStorage.has('MicropubAuth')).toBe(true)
})

test.each(['expired', 'account changed'])('rejects an attempt when %s', async reason => {
  const saved = attempt()
  if (reason === 'expired') {
    saved.expires_at = Date.now() - 1
  }
  else {
    Auth.selected_user = { username: 'other' }
  }
  mockStorage.set('MicropubAuth', JSON.stringify(saved))
  await expect(Services.check_micropub_credentials_and_proceed_setup(callback)).resolves.toBe(false)
  expect(MicroPubApi.verify_code).not.toHaveBeenCalled()
  expect(mockStorage.has('MicropubAuth')).toBe(false)
  expect(Services.checking_credentials).toBe(false)
})

test('clears a declined authorization without exchanging a code', async () => {
  mockStorage.set('MicropubAuth', JSON.stringify(attempt()))
  await Services.check_micropub_credentials_and_proceed_setup('microblog://indieauth?state=compact-state&error=access_denied')
  expect(MicroPubApi.verify_code).not.toHaveBeenCalled()
  expect(Alert.alert).not.toHaveBeenCalled()
  expect(mockStorage.has('MicropubAuth')).toBe(false)
})

test('does not save a token if the returned profile cannot be verified', async () => {
  mockStorage.set('MicropubAuth', JSON.stringify(attempt()))
  MicroPubApi.verify_profile.mockResolvedValue(false)
  await expect(Services.check_micropub_credentials_and_proceed_setup(callback)).resolves.toBe(false)
  expect(MicroPubApi.get_config).not.toHaveBeenCalled()
  expect(Tokens.create_new_service_token).not.toHaveBeenCalled()
})

test.each([AUTH_ERROR, UNSUPPORTED_PKCE])('reports discovery error %s without trying XML-RPC or opening authorization', async error => {
  MicroPubApi.discover_micropub_endpoints.mockResolvedValue(error)
  await Services.set_url('example.com')
  await Services.setup_new_service()
  expect(XMLRPCApi.discover_rsd_endpoint).not.toHaveBeenCalled()
  expect(WebBrowser.openAuthSessionAsync).not.toHaveBeenCalled()
  expect(Alert.alert).toHaveBeenCalled()
  expect(Services.is_setting_up).toBe(false)
})

test('clears an older attempt when a replacement begins or the blog is reset', async () => {
  mockStorage.set('MicropubAuth', JSON.stringify(attempt()))
  await Services.set_url('other.example')
  await Services.setup_new_service()
  expect(JSON.parse(SecureStore.setItemAsync.mock.calls[0][1]).blog_url).toBe('other.example')
  mockStorage.set('MicropubAuth', JSON.stringify(attempt()))
  await Services.clear()
  expect(mockStorage.has('MicropubAuth')).toBe(false)
})
