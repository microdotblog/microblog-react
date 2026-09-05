import App from '../../src/stores/App'
import Push from '../../src/stores/Push'
import Login from '../../src/stores/Login'
import MicroBlogApi from '../../src/api/MicroBlogApi'
import { Linking } from 'react-native'
import { CommonActions } from '@react-navigation/native'

jest.mock('../../src/api/MicroBlogApi', () => ({
  __esModule: true,
  default: { check_publishing_progress: jest.fn() }
}))

jest.mock('../../src/stores/Auth', () => ({
  selected_user: null,
  users: []
}))

jest.mock('../../src/stores/Login', () => ({
  is_loading: false,
  can_handle_open_url: jest.fn(() => false),
  trigger_login_from_url: jest.fn()
}))
jest.mock('../../src/stores/Reply', () => ({
  hydrate: jest.fn()
}))
jest.mock('../../src/stores/Discover', () => ({}))
jest.mock('../../src/stores/Settings', () => ({}))
jest.mock('../../src/stores/Services', () => ({}))

jest.mock('../../src/stores/Push', () => ({
  replay_pending_notification: jest.fn(),
  set_auth_ready: jest.fn(),
  check_and_remove_notifications_with_post_id: jest.fn()
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
  let current_time = 1000

  beforeEach(async () => {
    current_time += 10000
    jest.spyOn(Date, 'now').mockImplementation(() => current_time)
    Linking.canOpenURL = jest.fn(() => Promise.resolve(true))
    Linking.openURL = jest.fn(() => Promise.resolve())
    await App.set_navigation(null)
    await App.set_navigation_ready(false)
    await App.set_current_tab_key('Timeline')
    await App.set_is_loading(true)
    Push.replay_pending_notification.mockReset()
    Push.check_and_remove_notifications_with_post_id.mockReset()
    CommonActions.reset.mockClear()
  })

  test('starts in a loading state before hydrate finishes', () => {
    expect(App.is_loading).toBe(true)
  })

  afterEach(() => {
    Date.now.mockRestore()
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

  test('lets direct webview post open URLs navigate to conversation', async () => {
    const navigation = {
      isReady: jest.fn(() => true),
      navigate: jest.fn()
    }

    await App.set_navigation(navigation)
    await App.set_navigation_ready(true)
    await App.handle_url_from_webview('microblog://open/123')

    expect(navigation.navigate).toHaveBeenCalledWith('Timeline-Conversation', { conversation_id: '123' })
  })

  test('suppresses a conversation URL immediately after a webview link', async () => {
    const navigation = {
      isReady: jest.fn(() => true),
      navigate: jest.fn()
    }

    await App.set_navigation(navigation)
    await App.set_navigation_ready(true)
    await App.handle_url_from_webview('https://example.com/article')
    await App.handle_url_from_webview('https://micro.blog/example/123')

    expect(navigation.navigate).not.toHaveBeenCalled()

    current_time += 1000
    await App.handle_url_from_webview('microblog://open/456')

    expect(navigation.navigate).toHaveBeenCalledWith('Timeline-Conversation', { conversation_id: '456' })
  })
})

describe('App auth callback URLs', () => {
  let url_event_handler

  beforeEach(async () => {
    Login.is_loading = false
    Login.can_handle_open_url.mockReset()
    Login.trigger_login_from_url.mockReset()
    Login.can_handle_open_url.mockReturnValue(false)
    Linking.getInitialURL = jest.fn(() => Promise.resolve(null))
    if (!url_event_handler) {
      Linking.addEventListener = jest.fn((type, handler) => {
        if (type === 'url') {
          url_event_handler = handler
        }
        return { remove: jest.fn() }
      })
      await App.set_up_url_listener()
    }
  })

  test('signs in from a Micro.blog auth callback while the auth sheet is still open', async () => {
    const callback_url = 'microblog://auth/callback?code=27D1AEC374F9F621CB2D&state=4f36064754e102267754952f2535ce21'
    Login.is_loading = true
    Login.can_handle_open_url.mockReturnValue(true)

    url_event_handler({ url: callback_url })

    expect(Login.trigger_login_from_url).toHaveBeenCalledWith(callback_url)
  })
})

describe('Publishing completion', () => {
  afterEach(async () => {
    await App.hide_publishing_progress()
    jest.restoreAllMocks()
  })

  test('shows the third-party Location without polling Micro.blog', async () => {
    MicroBlogApi.check_publishing_progress.mockClear()
    await App.show_publishing_progress(false, 'https://third.example/post/1')
    expect(App.latest_published_url).toBe('https://third.example/post/1')
    expect(App.is_publishing).toBe(false)
    expect(App.publishing_progress_visible).toBe(true)
    expect(MicroBlogApi.check_publishing_progress).not.toHaveBeenCalled()
  })

  test('keeps the existing Micro.blog publishing progress behavior', async () => {
    MicroBlogApi.check_publishing_progress.mockResolvedValue({
      is_publishing: false, publishing_progress: 1, latest_url: 'https://blog.example/post/1'
    })
    await App.show_publishing_progress(true)
    expect(MicroBlogApi.check_publishing_progress).toHaveBeenCalled()
    expect(App.latest_published_url).toBe('https://blog.example/post/1')
  })

  test('does not let an earlier Micro.blog poll replace a third-party result', async () => {
    let finish_poll
    MicroBlogApi.check_publishing_progress.mockReturnValue(new Promise(resolve => { finish_poll = resolve }))
    await App.show_publishing_progress(true)
    await App.show_publishing_progress(false, 'https://third.example/post/1')
    finish_poll({ is_publishing: false, publishing_progress: 1, latest_url: 'https://blog.example/old-post' })
    await Promise.resolve()
    expect(App.latest_published_url).toBe('https://third.example/post/1')
  })

  test('finishes without polling when a third-party response has no Location', async () => {
    const toast = jest.spyOn(App, 'show_toast').mockImplementation(() => {})
    MicroBlogApi.check_publishing_progress.mockClear()
    await App.show_publishing_progress(false)
    expect(App.is_publishing).toBe(false)
    expect(App.publishing_progress_visible).toBe(false)
    expect(toast).toHaveBeenCalledWith('Post sent.')
    expect(MicroBlogApi.check_publishing_progress).not.toHaveBeenCalled()
  })
})
