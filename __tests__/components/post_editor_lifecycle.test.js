import { BackHandler } from 'react-native'
import PostEditorContainer from '../../src/components/posts/post_editor_container'
import PostButton from '../../src/components/header/post_button'
import UpdatePostButton from '../../src/components/header/update_post'
import ClosePostClearButton from '../../src/components/header/close_post_clear'
import CloseModalButton from '../../src/components/header/close'
import App from '../../src/stores/App'
import Auth from '../../src/stores/Auth'

jest.mock('mobx-react', () => ({ observer: component => component }))
jest.mock('react-native-sfsymbols', () => ({ SFSymbol: 'SFSymbol' }))
jest.mock('react-native-svg', () => ({ SvgXml: 'SvgXml' }))
jest.mock('../../src/components/share/liquid_glass_button', () => 'LiquidGlassButton')
jest.mock('../../src/utils/ui', () => ({ isLiquidGlass: () => true }))
jest.mock('../../src/stores/Auth', () => ({}))
jest.mock('../../src/stores/App', () => ({
  go_back: jest.fn(),
  theme_accent_color: () => '#ff8800',
  theme_text_color: () => '#000'
}))

beforeEach(() => jest.clearAllMocks())
afterEach(() => jest.restoreAllMocks())

test('locks the editor and Android Back while posting, and resets only after successful dismissal', () => {
  const remove = jest.fn()
  const add_listener = jest.spyOn(BackHandler, 'addEventListener').mockReturnValue({ remove })
  const posting = { is_sending_post: false, is_closing_after_post: false, clear_post: jest.fn() }
  const editor = new PostEditorContainer({ posting })
  editor.componentDidMount()
  const on_back = add_listener.mock.calls[0][1]
  expect(editor.render().props.pointerEvents).toBe('auto')
  expect(on_back()).toBe(false)

  posting.is_sending_post = true
  expect(editor.render().props.pointerEvents).toBe('none')
  expect(editor.render().props.accessibilityElementsHidden).toBe(true)
  expect(on_back()).toBe(true)
  expect(posting.clear_post).not.toHaveBeenCalled()

  posting.is_closing_after_post = true
  expect(on_back()).toBe(false)
  expect(posting.clear_post).not.toHaveBeenCalled()
  editor.componentWillUnmount()
  expect(remove).toHaveBeenCalled()
  expect(posting.clear_post).toHaveBeenCalledTimes(1)
})

test('closing an unsent editor preserves its content', () => {
  const posting = { is_closing_after_post: false, clear_post: jest.fn() }
  new PostEditorContainer({ posting }).componentWillUnmount()
  expect(posting.clear_post).not.toHaveBeenCalled()
})

test.each([[PostButton, 'send_post'], [UpdatePostButton, 'send_update_post']])('waits for a successful save before closing %p', async (Button, send_method) => {
  let resolve_save
  const posting = {
    post_status: 'draft', is_scheduled: () => false,
    [send_method]: jest.fn(() => new Promise(resolve => { resolve_save = resolve }))
  }
  Auth.selected_user = { posting }
  const saving = new Button({}).render().props.onPress()
  expect(App.go_back).not.toHaveBeenCalled()
  resolve_save(true)
  await saving
  expect(App.go_back).toHaveBeenCalledTimes(1)
})

test('disables submit and close buttons while saving', () => {
  const posting = { is_sending_post: true, is_scheduled: () => false }
  Auth.selected_user = { posting }
  for (const button of [new PostButton({}), new UpdatePostButton({}), new ClosePostClearButton({}), new CloseModalButton({ posting })]) {
    expect(button.render().props.disabled).toBe(true)
  }
})
