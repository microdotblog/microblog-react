import HighlightingText from '../../src/components/text/highlighting_text'
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
