import App from '../../src/stores/App'
import Push from '../../src/stores/Push'
import { CommonActions } from '@react-navigation/native'

jest.mock('../../src/api/MicroBlogApi', () => ({
  __esModule: true,
  default: {}
}))

jest.mock('../../src/stores/Auth', () => ({
  selected_user: null,
  users: []
}))

jest.mock('../../src/stores/Login', () => ({}))
jest.mock('../../src/stores/Reply', () => ({}))
jest.mock('../../src/stores/Discover', () => ({}))
jest.mock('../../src/stores/Settings', () => ({}))
jest.mock('../../src/stores/Services', () => ({}))

jest.mock('../../src/stores/Push', () => ({
  replay_pending_notification: jest.fn(),
  set_auth_ready: jest.fn()
}))

jest.mock('react-native-simple-toast', () => ({
  show: jest.fn()
}))

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn()
}))

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
}))

jest.mock('react-native-actions-sheet', () => ({
  SheetManager: {
    show: jest.fn(),
    hide: jest.fn()
  }
}))

jest.mock('@react-navigation/native', () => ({
  CommonActions: {
    reset: jest.fn(payload => ({
      type: 'RESET',
      payload
    }))
  },
  StackActions: {
    popToTop: jest.fn(() => ({
      type: 'POP_TO_TOP'
    }))
  }
}))

describe('App navigation reset', () => {
  beforeEach(async () => {
    await App.set_navigation(null)
    await App.set_navigation_ready(false)
    Push.replay_pending_notification.mockReset()
    CommonActions.reset.mockClear()
  })

  test('waits for navigation readiness before consuming a pending tab reset', async () => {
    const resetRoot = jest.fn()
    const isReady = jest.fn(() => false)
    const navigation = {
      isReady,
      resetRoot
    }
    const reset_state = {
      index: 0,
      routes: [{ name: 'Tabs' }]
    }

    await App.reset_to_tabs()
    expect(resetRoot).not.toHaveBeenCalled()

    await App.set_navigation(navigation)
    expect(resetRoot).not.toHaveBeenCalled()

    isReady.mockReturnValue(true)
    await App.set_navigation_ready(true)
    expect(resetRoot).toHaveBeenCalledWith(reset_state)

    await App.set_navigation_ready(true)
    expect(resetRoot).toHaveBeenCalledTimes(1)
  })

  test('consumes a pending tab reset when the navigation ref is already ready', async () => {
    const resetRoot = jest.fn()
    const navigation = {
      isReady: jest.fn(() => true),
      resetRoot
    }
    const reset_state = {
      index: 0,
      routes: [{ name: 'Tabs' }]
    }

    await App.reset_to_tabs()
    await App.set_navigation(navigation)

    expect(resetRoot).toHaveBeenCalledWith(reset_state)

    await App.set_navigation_ready(true)
    expect(resetRoot).toHaveBeenCalledTimes(1)
  })
})
