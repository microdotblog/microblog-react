import { Platform } from 'react-native'
import HighlightingText from '../../src/components/text/highlighting_text'
import editorHtml from '../../src/components/text/editor_html'
import App from '../../src/stores/App'

jest.mock('../../src/stores/App', () => ({
  font_scale: 1
}))

jest.mock('mobx-react', () => ({
  observer: component => component
}))

jest.mock('react-native-webview', () => ({
  WebView: 'WebView'
}))

jest.mock('../../src/components/keyboard/editor_keyboard_avoiding_view', () => {
  const React = require('react')
  return {
    EditorKeyboardFrameContext: React.createContext({
      window_bottom: 0,
      keyboard_height: 0
    })
  }
})

describe('HighlightingText font scaling', () => {
  test('requests native WebView focus when focusing the editor', () => {
    const requestFocus = jest.fn()
    const editor = new HighlightingText({})
    editor.webview = { current: { requestFocus } }
    editor.editorConfig = () => ({ editable: true })
    editor.injectJavaScript = jest.fn()

    editor.syncEditor({ focus: true })

    expect(requestFocus).toHaveBeenCalled()
  })

  test('keeps Android newlines in place instead of rewriting the document', () => {
    expect(editorHtml).toContain('insertLineBreakInPlace')
    expect(editorHtml).toContain('execCommand("insertLineBreak")')
    expect(editorHtml).toMatch(/if \(!insertedNewline\) \{\s*insertLineBreakInPlace\(\)/)
  })

  test('enables the Android keyboard proxy only when autoFocus is set', () => {
    const original = Platform.OS
    Platform.OS = 'android'
    try {
      const with_focus = new HighlightingText({ autoFocus: true })
      const without_focus = new HighlightingText({ autoFocus: false })
      expect(with_focus.state.android_focus_proxy).toBe(true)
      expect(without_focus.state.android_focus_proxy).toBe(false)
    }
    finally {
      Platform.OS = original
    }
  })

  test('uses the full system font scale by default', () => {
    App.font_scale = 3.5
    const editor = new HighlightingText({})

    expect(editor.scaledFontSize(18)).toBe(63)
  })

  test('supports a maximum font size multiplier', () => {
    App.font_scale = 3.5
    const editor = new HighlightingText({ maxFontSizeMultiplier: 2 })

    expect(editor.scaledFontSize(18)).toBe(36)
  })

  test('can disable font scaling', () => {
    App.font_scale = 3.5
    const editor = new HighlightingText({ allowFontScaling: false })

    expect(editor.scaledFontSize(18)).toBe(18)
  })
})
