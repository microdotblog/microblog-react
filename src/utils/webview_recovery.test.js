import { runInNewContext } from 'node:vm'
import {
  build_webview_source_uri,
  createWebViewHealthCheck,
} from './webview_recovery'

describe('web view recovery', () => {
  test('opts the initial hybrid sign-in session into plain JavaScript', () => {
    const uri = build_webview_source_uri({
      did_load_one_or_more_webviews: false,
      endpoint: 'hybrid/posts',
      theme: 'dark',
      token: 'test token',
      web_url: 'https://micro.blog',
    })

    expect(uri).toContain('/hybrid/signin?')
    expect(uri).toContain('plainjs=1')
    expect(uri).toContain('token=test%20token')
  })

  test('does not add the capability to later hybrid requests', () => {
    const uri = build_webview_source_uri({
      did_load_one_or_more_webviews: true,
      endpoint: 'hybrid/posts',
      theme: 'light',
      token: 'test-token',
      web_url: 'https://micro.blog',
    })

    expect(uri).toBe('https://micro.blog/hybrid/posts?theme=light&show_actions=true&fontsize=17')
  })
})

describe('WebView health check', () => {
  const runProbe = (script, reply, protocol = 'https:') => runInNewContext(script, {
    document: { body: {} },
    window: { location: { protocol }, ReactNativeWebView: { postMessage: reply } }
  })

  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  test('waits one second and keeps the page when the injected script replies', () => {
    const check = createWebViewHealthCheck()
    const web_view = {
      injectJavaScript: jest.fn(script => runProbe(script, check.handleMessage))
    }
    const on_result = jest.fn()
    check.schedule(web_view, () => true, on_result)
    check.schedule(web_view, () => true, on_result)
    jest.advanceTimersByTime(999)
    expect(web_view.injectJavaScript).not.toHaveBeenCalled()

    jest.advanceTimersByTime(1)
    expect(web_view.injectJavaScript).toHaveBeenCalledTimes(1)
    expect(on_result).toHaveBeenCalledWith(true)
    jest.advanceTimersByTime(1500)
    expect(on_result).toHaveBeenCalledTimes(1)
  })

  test('reports a timeout when the page fails to answer', () => {
    const check = createWebViewHealthCheck()
    const web_view = { injectJavaScript: jest.fn() }
    const on_result = jest.fn()
    check.schedule(web_view, () => true, on_result)

    jest.advanceTimersByTime(2499)
    expect(on_result).not.toHaveBeenCalled()
    jest.advanceTimersByTime(1)
    expect(on_result).toHaveBeenCalledWith(false)
  })

  test('does not count a blank page as a healthy WebView', () => {
    const check = createWebViewHealthCheck()
    const web_view = { injectJavaScript: script => runProbe(script, check.handleMessage, 'about:') }
    const on_result = jest.fn()
    check.schedule(web_view, () => true, on_result)

    jest.advanceTimersByTime(2500)
    expect(on_result).toHaveBeenCalledWith(false)
  })

  test('ignores a delayed reply after a navigation cancels a check', () => {
    const check = createWebViewHealthCheck()
    const web_view = { injectJavaScript: jest.fn() }
    const on_result = jest.fn()
    check.schedule(web_view, () => true, on_result)
    jest.advanceTimersByTime(1000)
    const old_script = web_view.injectJavaScript.mock.calls[0][0]
    check.cancel()

    check.schedule(web_view, () => true, on_result)
    jest.advanceTimersByTime(1000)
    runProbe(old_script, check.handleMessage)
    jest.advanceTimersByTime(1500)
    expect(on_result).toHaveBeenCalledTimes(1)
    expect(on_result).toHaveBeenCalledWith(false)
  })

  test('does not recover a WebView that became inactive before the timeout', () => {
    const check = createWebViewHealthCheck()
    const can_check = jest.fn(() => true)
    const on_result = jest.fn()
    check.schedule({ injectJavaScript: jest.fn() }, can_check, on_result)
    jest.advanceTimersByTime(1000)
    can_check.mockReturnValue(false)
    jest.advanceTimersByTime(1500)
    expect(on_result).not.toHaveBeenCalled()
  })
})
