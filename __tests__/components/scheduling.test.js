import { Platform } from 'react-native'
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import SchedulePicker from '../../src/components/posts/schedule_picker'
import SchedulePostSheet from '../../src/components/sheets/schedule_post'
import PostingOptionsScreen from '../../src/screens/posts/options'
import PostButton from '../../src/components/header/post_button'
import UpdatePostButton from '../../src/components/header/update_post'
import Auth from '../../src/stores/Auth'
import { SheetManager } from 'react-native-actions-sheet'

jest.mock('mobx-react', () => ({ observer: component => component }))
jest.mock('@react-native-community/datetimepicker', () => ({
  __esModule: true, default: 'DateTimePicker', DateTimePickerAndroid: { open: jest.fn() }
}))
jest.mock('react-native-actions-sheet', () => ({
  __esModule: true, default: 'ActionSheet', SheetManager: { hide: jest.fn() }
}))
jest.mock('react-native-keyboard-controller', () => ({ KeyboardAvoidingView: 'KeyboardAvoidingView' }))
jest.mock('../../src/components/share/liquid_glass_button', () => 'LiquidGlassButton')
jest.mock('../../src/utils/ui', () => ({ isLiquidGlass: () => true }))
jest.mock('../../src/stores/Auth', () => ({}))
jest.mock('../../src/stores/App', () => ({
  is_dark_mode: () => false,
  theme_accent_color: () => '#ff8800',
  theme_text_color: () => '#000',
  theme_background_color: () => '#fff',
  theme_button_background_color: () => '#eee',
  theme_button_text_color: () => '#000',
  theme_section_background_color: () => '#eee',
  theme_input_background_color: () => '#fff',
  theme_border_color: () => '#ccc',
  theme_placeholder_text_color: () => '#888'
}))

const findPicker = element => {
  if (element?.type === SchedulePicker) {
    return element
  }
  const children = [element?.props?.children].flat(Infinity)
  return children.filter(Boolean).map(child => findPicker(child)).find(Boolean)
}

beforeEach(() => jest.clearAllMocks())
afterEach(() => jest.restoreAllMocks())

test('iOS uses an inline calendar and time picker and sends an unambiguous timestamp', () => {
  jest.replaceProperty(Platform, 'OS', 'ios')
  const onChange = jest.fn()
  const picker = new SchedulePicker({ value: '2099-06-01T09:30:00-05:00', onChange }).render()
  expect(picker.type).toBe(DateTimePicker)
  expect(picker.props).toMatchObject({ display: 'inline', mode: 'datetime' })
  picker.props.onValueChange({}, new Date('2099-06-02T10:45:00-05:00'))
  expect(onChange).toHaveBeenCalledWith('2099-06-02T15:45:00.000Z')
})

test('Android date and time fields open the native picker with the current selection', () => {
  jest.replaceProperty(Platform, 'OS', 'android')
  const onChange = jest.fn()
  const value = '2099-06-01T14:30:00.000Z'
  const component = new SchedulePicker({ value, onChange })
  for (const mode of ['date', 'time']) {
    component.showAndroidPicker(mode)
    expect(DateTimePickerAndroid.open).toHaveBeenLastCalledWith(expect.objectContaining({ value: new Date(value), mode }))
  }
  DateTimePickerAndroid.open.mock.calls[1][0].onValueChange({}, new Date('2099-06-01T16:00:00Z'))
  expect(onChange).toHaveBeenCalledWith('2099-06-01T16:00:00.000Z')
})

test('the options pane and modal use the same picker', () => {
  const posting = {
    selected_service: {
      type: 'micropub', config: { active_destination: () => ({ categories: [] }) },
      active_destination: () => ({ syndicates: [] })
    },
    post_published: '2099-06-01T14:30:00.000Z', set_post_published: jest.fn()
  }
  Auth.selected_user = { posting }
  const options_picker = findPicker(new PostingOptionsScreen({}).render())
  const modal_picker = findPicker(new SchedulePostSheet({ sheetId: 'schedule_post_sheet' }).render())
  expect(options_picker.props.value).toBe(posting.post_published)
  options_picker.props.onChange('2099-06-02T14:30:00Z')
  expect(posting.set_post_published).toHaveBeenCalledWith('2099-06-02T14:30:00Z')
  expect(modal_picker).toBeDefined()
})

test.each([
  [true, 'published', 'Schedule', 'Schedule'],
  [false, 'published', 'Post', 'Update'],
  [false, 'draft', 'Save', 'Update']
])('the editor buttons reflect scheduling and draft status', (is_scheduled, post_status, create_title, edit_title) => {
  Auth.selected_user = { posting: { post_status, is_scheduled: () => is_scheduled } }
  expect(new PostButton({}).render().props.title).toBe(create_title)
  expect(new UpdatePostButton({}).render().props.title).toBe(edit_title)
})

test.each([true, false])('the scheduling modal closes only after a successful save: %s', async success => {
  const service = { schedule_post: jest.fn().mockResolvedValue(success) }
  const post = { url: 'https://example.com/draft' }
  const sheet = new SchedulePostSheet({ sheetId: 'schedule_post_sheet', payload: { service, post } })
  // Exercise the handler without mounting a native sheet.
  sheet.setState = update => { sheet.state = { ...sheet.state, ...update } }
  sheet.state.published = '2099-06-01T14:30:00.000Z'
  await sheet.schedulePost()
  expect(service.schedule_post).toHaveBeenCalledWith(post, sheet.state.published)
  expect(SheetManager.hide).toHaveBeenCalledTimes(success ? 1 : 0)
  expect(sheet.state.is_saving).toBe(false)
})
