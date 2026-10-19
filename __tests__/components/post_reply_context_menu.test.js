import { Alert } from 'react-native'
import ContextMenu from 'react-native-context-menu-view'
import Clipboard from '@react-native-clipboard/clipboard'
import ReplyCell from '../../src/components/cells/reply_cell'
import PostCell from '../../src/components/cells/post_cell'
import App from '../../src/stores/App'
import MicroBlogApi, { API_ERROR } from '../../src/api/MicroBlogApi'

jest.mock('mobx-react', () => ({ observer: component => component }))
jest.mock('react-native-context-menu-view', () => 'ContextMenu')
jest.mock('react-native-gesture-handler/Swipeable', () => 'Swipeable')
jest.mock('react-native-gesture-handler', () => ({ RectButton: 'RectButton' }))
jest.mock('react-native-svg', () => ({ SvgXml: 'SvgXml' }))
jest.mock('@react-native-clipboard/clipboard', () => ({ setString: jest.fn() }))
jest.mock('react-native-simple-toast', () => ({ showWithGravity: jest.fn(), SHORT: 0, CENTER: 1 }))
jest.mock('../../src/components/common/MBImage', () => 'MBImage')
jest.mock('../../src/stores/Auth', () => ({}))
jest.mock('../../src/stores/App', () => ({
  navigate_to_screen: jest.fn(),
  open_url: jest.fn(),
  theme_alt_background_div_color: () => '#ccc',
  theme_background_color_secondary: () => '#fff',
  theme_text_color: () => '#000',
  theme_default_font_size: () => 16
}))
jest.mock('../../src/api/MicroBlogApi', () => ({
  __esModule: true,
  API_ERROR: 5,
  default: { get_conversation_id_for_url: jest.fn() }
}))

beforeEach(() => {
  jest.clearAllMocks()
  jest.spyOn(Alert, 'alert').mockImplementation(() => {})
})
afterEach(() => jest.restoreAllMocks())

const makeReply = () => ({
  id: '12345', url: 'https://micro.blog/alice/12345', content_text: 'A reply',
  can_edit: jest.fn(() => true), relative_date: () => '1 hour ago',
  trigger_edit: jest.fn(), trigger_delete: jest.fn()
})

test('Replies wraps the row in a context menu with Delete last', () => {
  const reply = makeReply()
  const cell = new ReplyCell({ reply })
  const menu = cell.render().props.children
  expect(menu.type).toBe(ContextMenu)
  expect(menu.props.actions.map(action => action.title)).toEqual(['Edit', 'Copy Link', 'Open in Browser', 'Show Conversation', 'Delete'])
  expect(menu.props.actions.find(action => action.title === 'Delete').destructive).toBe(true)

  for (const name of ['Edit', 'Copy Link', 'Open in Browser', 'Show Conversation', 'Delete']) {
    menu.props.onPress({ nativeEvent: { name } })
  }
  expect(reply.trigger_edit).toHaveBeenCalledTimes(1)
  expect(reply.trigger_delete).toHaveBeenCalledTimes(1)
  expect(Clipboard.setString).toHaveBeenCalledWith(reply.url)
  expect(App.open_url).toHaveBeenCalledWith(reply.url)
  expect(App.navigate_to_screen).toHaveBeenCalledWith('open', reply.id)
})

test('older replies keep Edit disabled and cannot invoke the editor through the menu', () => {
  const reply = makeReply()
  reply.can_edit.mockReturnValue(false)
  const cell = new ReplyCell({ reply })
  expect(cell.make_context_menu(reply).find(action => action.title === 'Edit').disabled).toBe(true)
  cell._handle_context_menu({ nativeEvent: { name: 'Edit' } })
  expect(reply.trigger_edit).not.toHaveBeenCalled()
})

test('a reply without a URL cannot copy or open a missing link', () => {
  const reply = { ...makeReply(), url: null }
  const cell = new ReplyCell({ reply })
  expect(cell.make_context_menu(reply).find(action => action.title === 'Copy Link').disabled).toBe(true)
  expect(cell.make_context_menu(reply).find(action => action.title === 'Open in Browser').disabled).toBe(true)
  cell._handle_context_menu({ nativeEvent: { name: 'Copy Link' } })
  cell._handle_context_menu({ nativeEvent: { name: 'Open in Browser' } })
  expect(Clipboard.setString).not.toHaveBeenCalled()
  expect(App.open_url).not.toHaveBeenCalled()
})

const published_post = { uid: 'blog-post-987', post_status: 'published', published: '2020-01-01T12:00:00Z', url: 'https://alice.example/post.html' }

test.each([
  [published_post, true],
  [{ ...published_post, post_status: 'draft' }, false],
  [{ ...published_post, published: '2999-01-01T12:00:00Z' }, false],
  [{ ...published_post, published: undefined }, false],
  [{ ...published_post, url: undefined }, false]
])('offers Show Conversation only for an already published post: %p', (post, visible) => {
  const cell = new PostCell({ post })
  expect(cell.make_context_menu(post).some(action => action.title === 'Show Conversation')).toBe(visible)
})

test('Posts opens the resolved conversation ID instead of its blog post ID', async () => {
  MicroBlogApi.get_conversation_id_for_url.mockResolvedValue('12345')
  const post = {
    ...published_post,
    plain_text_content: () => 'A post', images_from_content: () => [],
    nice_local_published_date: () => 'January 1, 2020', is_draft: () => false
  }
  const cell = new PostCell({ post })
  const menu = cell.render().props.children
  menu.props.onPress({ nativeEvent: { name: 'Show Conversation' } })
  await Promise.resolve()
  expect(MicroBlogApi.get_conversation_id_for_url).toHaveBeenCalledWith(published_post.url)
  expect(App.navigate_to_screen).toHaveBeenCalledWith('open', '12345')
})

test.each([null, API_ERROR])('Posts reports a failed conversation lookup %p without navigating', async result => {
  MicroBlogApi.get_conversation_id_for_url.mockResolvedValue(result)
  await new PostCell({ post: published_post })._show_conversation()
  expect(Alert.alert).toHaveBeenCalledWith('Could Not Show Conversation', expect.any(String))
  expect(App.navigate_to_screen).not.toHaveBeenCalled()
})
