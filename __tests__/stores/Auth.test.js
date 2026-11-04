import { applySnapshot } from 'mobx-state-tree'
import { Platform } from 'react-native'
import CookieManager from '@react-native-cookies/cookies'
import Auth from '../../src/stores/Auth'
import Tokens from '../../src/stores/Tokens'

jest.mock('@react-native-cookies/cookies', () => ({ clearAll: jest.fn() }))
jest.mock('@react-native-async-storage/async-storage', () => ({ clear: jest.fn() }))
jest.mock('../../src/stores/Tokens', () => ({
  add_new_token: jest.fn(),
  destroy_all_token_data: jest.fn()
}))
jest.mock('../../src/stores/Services', () => ({ clear_micropub_authorization: jest.fn().mockResolvedValue() }))
jest.mock('../../src/stores/Push', () => ({}))
jest.mock('../../src/stores/App', () => ({}))
jest.mock('react-native-simple-toast', () => ({ showWithGravity: jest.fn() }))
jest.mock('../../src/stores/models/User', () => {
  const { types } = require('mobx-state-tree')
  return types.model('User', {
    username: types.identifier,
    posting: types.optional(types.model({ selected_service: types.maybeNull(types.string) }), {})
  }).actions(() => ({ register_for_push() {} }))
})

const deferred = () => {
  let resolve
  const promise = new Promise(done => { resolve = done })
  return { promise, resolve }
}

beforeEach(() => {
  jest.useFakeTimers({ doNotFake: ['setImmediate', 'queueMicrotask'] })
  jest.clearAllMocks()
  jest.spyOn(console, 'log').mockImplementation(() => {})
  CookieManager.clearAll.mockResolvedValue(true)
  applySnapshot(Auth, {
    users: [{ username: 'alice' }, { username: 'bob' }],
    selected_user: 'alice',
    is_selecting_user: false,
    did_load_one_or_more_webviews: true
  })
})

afterEach(() => {
  jest.clearAllTimers()
  jest.useRealTimers()
  jest.restoreAllMocks()
})

test.each(['ios', 'android'])('waits for cookie clearing before switching accounts on %s', async platform => {
  jest.replaceProperty(Platform, 'OS', platform)
  const native_cookies = deferred()
  const webview_cookies = deferred()
  CookieManager.clearAll.mockImplementation(useWebKit => useWebKit ? webview_cookies.promise : native_cookies.promise)

  const switching = Auth.select_user(Auth.users[1])
  // select_user first clears any pending Micropub authorization.
  await Promise.resolve()
  expect(Auth.is_selecting_user).toBe(true)
  expect(Auth.did_load_one_or_more_webviews).toBe(false)
  expect(Auth.selected_user.username).toBe('alice')

  native_cookies.resolve(true)
  await Promise.resolve()
  if (platform === 'ios') {
    expect(CookieManager.clearAll).toHaveBeenCalledWith(true)
    expect(Auth.selected_user.username).toBe('alice')
    expect(Auth.is_selecting_user).toBe(true)
    webview_cookies.resolve(true)
  }

  await switching
  expect(CookieManager.clearAll.mock.calls).toEqual(platform === 'ios' ? [[], [true]] : [[]])
  expect(Auth.selected_user.username).toBe('bob')
  expect(Auth.is_selecting_user).toBe(false)
  expect(Auth.did_load_one_or_more_webviews).toBe(false)
})

test('clears the previous WebView session before adding an account', async () => {
  jest.replaceProperty(Platform, 'OS', 'ios')
  const webview_cookies = deferred()
  CookieManager.clearAll.mockImplementation(useWebKit => useWebKit ? webview_cookies.promise : Promise.resolve(true))
  Tokens.add_new_token.mockResolvedValue({ username: 'carol' })

  const login = Auth.handle_new_login({ username: 'carol', token: 'carol-token' })
  await Promise.resolve()
  await Promise.resolve()
  expect(CookieManager.clearAll).toHaveBeenCalledWith(true)
  expect(Auth.selected_user.username).toBe('alice')
  expect(Auth.users).toHaveLength(2)
  expect(Auth.is_selecting_user).toBe(true)

  webview_cookies.resolve(true)
  await expect(login).resolves.toBe(true)
  expect(Auth.selected_user.username).toBe('carol')
  expect(Auth.users).toHaveLength(3)
  expect(Auth.is_selecting_user).toBe(false)
})
