import PostsScreen from '../../src/screens/posts/posts'
import Auth from '../../src/stores/Auth'

jest.mock('mobx-react', () => ({ observer: component => component }))
jest.mock('react-native-sfsymbols', () => ({ SFSymbol: 'SFSymbol' }))
jest.mock('../../src/components/cells/post_cell', () => 'PostCell')
jest.mock('../../src/components/search_bar', () => 'SearchBar')
jest.mock('../../src/components/common/horizontal_safe_area_view', () => 'HorizontalSafeAreaView')
jest.mock('../../src/stores/Auth', () => ({}))
jest.mock('../../src/stores/App', () => ({ post_search_query: '' }))

test('hides Drafts after refreshing the last published draft and switches to the full posts list', () => {
  const draft = { post_status: 'draft' }
  const destination = { uid: 'blog', posts: [draft], drafts: [draft] }
  const service = {
    id: 'service', config: { posts_destination: () => destination },
    is_loading_posts: false, check_for_posts_for_destination: jest.fn()
  }
  Auth.selected_user = { posting: { selected_service: service } }
  const screen = new PostsScreen({})
  screen.setState = update => { screen.state = { ...screen.state, ...update } }
  screen.componentDidUpdate()
  expect(screen.state.is_showing_drafts_button).toBe(true)

  screen.state.is_showing_drafts_posts = true
  service.is_loading_posts = true
  destination.posts = [{ post_status: 'published' }]
  destination.drafts = []
  screen.componentDidUpdate()
  expect(screen.state.is_showing_drafts_button).toBe(true)
  expect(screen.state.is_showing_drafts_posts).toBe(true)

  service.is_loading_posts = false
  screen.componentDidUpdate()
  expect(screen.state.is_showing_drafts_button).toBe(false)
  expect(screen.state.is_showing_drafts_posts).toBe(false)
  screen.componentDidUpdate()
  expect(service.check_for_posts_for_destination).toHaveBeenLastCalledWith(destination, false)
})

test('keeps Drafts available while another draft remains', () => {
  const destination = { uid: 'blog', posts: [{ post_status: 'published' }], drafts: [{ post_status: 'draft' }] }
  Auth.selected_user = { posting: { selected_service: {
    config: { posts_destination: () => destination }, is_loading_posts: false
  } } }
  const screen = new PostsScreen({})
  screen.setState = update => { screen.state = { ...screen.state, ...update } }
  screen._update_drafts_button()
  expect(screen.state.is_showing_drafts_button).toBe(true)
})
