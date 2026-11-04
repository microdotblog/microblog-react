import { applySnapshot, getSnapshot } from 'mobx-state-tree'
import { Alert } from 'react-native'
import { launchImageLibrary } from 'react-native-image-picker'
import axios from 'axios'
import MicroPubApi from '../../src/api/MicroPubApi'
import Posting from '../../src/stores/models/Posting'
import Post from '../../src/stores/models/posting/Post'
import Destination from '../../src/stores/models/posting/Destination'
import * as largeMedia from '../../src/stores/models/posting/uploadLargeMediaTask'
import App from '../../src/stores/App'
import Tokens from '../../src/stores/Tokens'

jest.mock('../../src/stores/App', () => ({
  show_publishing_progress: jest.fn(),
  show_toast: jest.fn()
}))
jest.mock('../../src/stores/Auth', () => ({}))
jest.mock('../../src/stores/Tokens', () => ({
  token_for_service_id: jest.fn(),
  token_for_username: jest.fn()
}))
jest.mock('../../src/api/XMLRPCApi', () => ({ __esModule: true, default: {}, XML_ERROR: 2 }))
jest.mock('react-native-fs', () => ({}))
jest.mock('react-native-image-picker', () => ({ launchImageLibrary: jest.fn() }))
jest.mock('@react-native-documents/picker', () => ({}))
jest.mock('@react-native-clipboard/clipboard', () => ({}))
jest.mock('react-native-simple-toast', () => ({}))
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  CancelToken: { source: () => ({ token: {}, cancel: jest.fn() }) },
  isCancel: () => false
}))

const endpoint = 'https://third.example/micropub'
const media_endpoint = 'https://media.third.example/upload'
const post_url = 'https://third.example/post/1'
const createPosting = (is_microblog = false, media = media_endpoint) => {
  Tokens.token_for_service_id.mockReturnValue(undefined)
  Tokens.token_for_username.mockReturnValue(undefined)
  const posting = Posting.create({
    username: 'test',
    services: [{
      id: 'service', name: is_microblog ? 'Micro.blog' : 'Third party', type: 'micropub', url: endpoint,
      username: 'test', is_microblog,
      config: { 'media-endpoint': media, selected_posts_destination: 'blog', destination: [{ uid: 'blog', syndicates: [{ uid: 'a', name: 'A' }, { uid: 'b', name: 'B' }] }] }
    }],
    selected_service: 'service',
    post_text: 'Hello'
  })
  Tokens.token_for_service_id.mockReturnValue({ token: 'token' })
  Tokens.token_for_username.mockReturnValue({ token: 'token' })
  return posting
}

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {})
  jest.spyOn(Alert, 'alert').mockImplementation(() => {})
  jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, status: 201, headers: { get: () => post_url } })
  axios.get.mockReset().mockResolvedValue({ data: {} })
  App.show_publishing_progress.mockClear()
  App.show_toast.mockClear()
})
afterEach(() => jest.restoreAllMocks())

test('initializes a generic destination and keeps standard syndication targets', async () => {
  const posting = createPosting()
  const service = posting.selected_service
  const targets = [{ uid: 'social.example/user', name: 'Social' }]
  await service.set_initial_config({ 'media-endpoint': media_endpoint, 'syndicate-to': targets })
  expect(service.active_destination().uid).toBe('')
  expect(service.config.posts_destination()).toBe(service.active_destination())
  expect(getSnapshot(service.active_destination().syndicates)).toEqual(targets)
  expect(service.service_object()).toMatchObject({ is_microblog: false, media_endpoint, destination: null, temporary_destination: null })
  await service.set_initial_config({})
  expect(service.active_destination()).not.toBeNull()
})

test.each([[undefined], [[]], [[{ uid: 'blog', name: 'Blog' }]], [[{ uid: endpoint, name: 'Blog' }]]])('only sends advertised destinations for configuration %j', async destinations => {
  const service = createPosting().selected_service
  await service.set_initial_config({ 'media-endpoint': media_endpoint, destination: destinations, 'syndicate-to': [] })
  const destination = service.active_destination()
  const api_service = service.service_object()
  const expected_destination = destinations?.[0]?.uid || null

  expect(service.config.posts_destination()).toBe(destination)
  expect(api_service.destination).toBe(expected_destination)
  expect(api_service.temporary_destination).toBe(expected_destination)

  await MicroPubApi.send_post(api_service, 'Hello')
  await MicroPubApi.post_update(api_service, 'Edited', post_url)
  await MicroPubApi.delete_post(api_service, post_url)
  for (const [, options] of fetch.mock.calls) {
    const body = options.headers['Content-Type'] === 'application/json' ? JSON.parse(options.body) :
      Object.fromEntries(new (require('url').URLSearchParams)(options.body))
    if (expected_destination) {
      expect(body['mp-destination']).toBe(expected_destination)
    }
    else {
      expect(body).not.toHaveProperty('mp-destination')
    }
  }

  axios.get.mockClear()
  for (const method of ['get_categories', 'get_syndicate_to', 'get_posts', 'get_pages', 'get_uploads', 'get_collections', 'get_uploads_from_collection']) {
    await MicroPubApi[method](api_service, destination.uid)
  }
  for (const [url, options] of axios.get.mock.calls) {
    const request_url = jest.requireActual('axios').getUri({ url, ...options })
    const params = new (require('url').URL)(request_url).searchParams
    expect(params.get('mp-destination')).toBe(expected_destination)
  }

  const original_form_data = global.FormData
  global.FormData = require('react-native/Libraries/Network/FormData').default
  axios.post.mockClear()
  axios.post.mockResolvedValue({ data: {} })
  try {
    await MicroPubApi.upload_image(api_service, {
      uri: 'file:///tmp/photo.jpg', type: 'image/jpeg', cancel_source: { token: {} }
    })
    const parts = axios.post.mock.calls[0][1].getParts()
    expect(parts.filter(part => part.fieldName === 'mp-destination').map(part => part.string)).toEqual(
      expected_destination ? [expected_destination] : []
    )
  }
  finally {
    global.FormData = original_form_data
  }
})

test('keeps existing configuration when refresh fails', async () => {
  const service = createPosting().selected_service
  const config = getSnapshot(service.config)
  fetch.mockRejectedValue(new Error('Offline'))
  await service.hydrate()
  expect(getSnapshot(service.config)).toEqual(config)
})

test.each(['posts', 'pages', 'uploads'])('switching blogs in the editor and then %s keeps edits on the current blog', async type => {
  const posting = createPosting(true)
  const service = posting.selected_service
  await service.set_initial_config({
    destination: [{ uid: 'blog', 'microblog-default': true }, { uid: 'other' }],
    'syndicate-to': []
  })
  const config = service.config
  const [blog, other] = config.destination
  blog.set_posts([{ properties: { uid: ['post'], url: [post_url], content: ['Original'] } }])

  config.set_default_destination(other)
  expect([config.posts_destination(), config.pages_destination(), config.uploads_destination()]).toEqual([other, other, other])

  await service.set_active_destination(blog, type)
  expect(service.active_destination()).toBe(blog)
  expect([config.posts_destination(), config.pages_destination(), config.uploads_destination()]).toEqual([blog, blog, blog])
  expect(service.service_object()).toMatchObject({ destination: 'blog', temporary_destination: 'blog' })

  await posting.hydrate_post_edit(blog.posts[0])
  await expect(posting.send_update_post()).resolves.toBe(true)
  expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({ url: post_url, 'mp-destination': 'blog' })
})

test('restores one current blog from saved selection and preserves it across configuration refreshes', async () => {
  const service = createPosting(true).selected_service
  const server_config = {
    destination: [{ uid: 'blog', 'microblog-default': true }, { uid: 'other' }],
    'syndicate-to': []
  }
  await service.set_initial_config(server_config)
  applySnapshot(service.config, { ...getSnapshot(service.config), selected_posts_destination: 'other' })
  expect(service.active_destination().uid).toBe('other')
  expect(service.config.posts_destination()).toBe(service.active_destination())

  jest.spyOn(MicroPubApi, 'get_config').mockResolvedValue(server_config)
  await service.hydrate()

  expect(service.active_destination().uid).toBe('other')
  expect(service.config.posts_destination()).toBe(service.active_destination())
  expect(service.service_object()).toMatchObject({ destination: 'other', temporary_destination: 'other' })
})

test('sends all selected syndication targets and uses the external post URL', async () => {
  const posting = createPosting()
  await expect(posting.send_post()).resolves.toBe(true)
  const params = new (require('url').URLSearchParams)(fetch.mock.calls[0][1].body)
  expect(params.getAll('mp-syndicate-to[]')).toEqual(['a', 'b'])
  expect(App.show_publishing_progress).toHaveBeenCalledWith(false, post_url)
})

test('omits syndication when all Micro.blog targets are selected', async () => {
  const posting = createPosting(true)
  await expect(posting.send_post()).resolves.toBe(true)
  const params = new (require('url').URLSearchParams)(fetch.mock.calls[0][1].body)
  expect(params.has('mp-syndicate-to')).toBe(false)
  expect(params.has('mp-syndicate-to[]')).toBe(false)
})

test.each([false, true])('omits syndication and clears stale selections when no targets exist, is_microblog=%s', async is_microblog => {
  const posting = createPosting(is_microblog)
  posting.selected_service.active_destination().set_syndicate_to_targets([])
  await posting.reset_post_syndicates()
  expect(getSnapshot(posting.post_syndicates)).toEqual([])
  await expect(posting.send_post()).resolves.toBe(true)
  const params = new (require('url').URLSearchParams)(fetch.mock.calls[0][1].body)
  expect(params.has('mp-syndicate-to')).toBe(false)
  expect(params.has('mp-syndicate-to[]')).toBe(false)
})

test.each([false, true])('sends a single selected target as an array, is_microblog=%s', async is_microblog => {
  const posting = createPosting(is_microblog)
  await posting.handle_post_syndicates_select('b')
  await expect(posting.send_post()).resolves.toBe(true)
  const params = new (require('url').URLSearchParams)(fetch.mock.calls[0][1].body)
  expect(params.getAll('mp-syndicate-to[]')).toEqual(['a'])
  expect(params.has('mp-syndicate-to')).toBe(false)
})

test.each([false, true])('sends an explicit empty list when all targets are deselected, is_microblog=%s', async is_microblog => {
  const posting = createPosting(is_microblog)
  await posting.handle_post_syndicates_select('a')
  await posting.handle_post_syndicates_select('b')
  await expect(posting.send_post()).resolves.toBe(true)
  const options = fetch.mock.calls[0][1]
  expect(options.headers['Content-Type']).toBe('application/json')
  expect(JSON.parse(options.body)['mp-syndicate-to']).toEqual([])
})

test('clears the sending flag and preserves the draft when the network fails', async () => {
  const posting = createPosting()
  posting.set_post_published('2099-06-01T14:30:00.000Z')
  fetch.mockRejectedValue(new Error('Offline'))
  await expect(posting.send_post()).resolves.toBe(false)
  expect(posting.is_sending_post).toBe(false)
  expect(posting.post_text).toBe('Hello')
  expect(posting.post_published).toBe('2099-06-01T14:30:00.000Z')
  expect(App.show_publishing_progress).not.toHaveBeenCalled()
})

test('posts a file without trying a separate upload when there is no media endpoint', async () => {
  const posting = createPosting(false, null)
  const upload = jest.spyOn(MicroPubApi, 'upload_image')
  await posting.create_and_attach_asset({ uri: 'file:///tmp/photo.jpg', type: 'image/jpeg' })
  expect(posting.post_assets[0].is_uploading).toBe(false)
  expect(upload).not.toHaveBeenCalled()
  const original_form_data = global.FormData
  global.FormData = require('react-native/Libraries/Network/FormData').default
  try {
    await expect(posting.send_post()).resolves.toBe(true)
    expect(fetch.mock.calls[0][1].body.getParts()).toEqual(expect.arrayContaining([
      expect.objectContaining({ fieldName: 'photo', uri: 'file:///tmp/photo.jpg' })
    ]))
  }
  finally { global.FormData = original_form_data }
})

test.each([false, true])('selects the correct video upload protocol when is_microblog=%s', async is_microblog => {
  const posting = createPosting(is_microblog)
  launchImageLibrary.mockResolvedValue({ assets: [{ uri: 'file:///tmp/clip.mp4', type: 'video/mp4', fileSize: 8 }] })
  const standard_upload = jest.spyOn(MicroPubApi, 'upload_image').mockResolvedValue({ success: true, headers: { location: 'https://media.third.example/clip.mp4' } })
  const chunked_upload = jest.spyOn(largeMedia, 'upload_large_media_task').mockResolvedValue({ url: 'https://media.third.example/clip.mp4' })
  await posting.handle_asset_action()
  if (is_microblog) {
    expect(chunked_upload).toHaveBeenCalledWith(expect.objectContaining({ service_object: expect.objectContaining({ is_microblog: true }) }))
    expect(standard_upload).not.toHaveBeenCalled()
  }
  else {
    expect(standard_upload).toHaveBeenCalledWith(expect.objectContaining({ is_microblog: false }), expect.anything())
    expect(chunked_upload).not.toHaveBeenCalled()
  }
})

test('loads HTML posts, drafts, and pages without requiring numeric IDs', () => {
  const destination = Destination.create({ uid: 'blog' })
  const entries = [{ properties: { url: [post_url], content: [{ html: '<p>Hello</p>' }] } }]
  destination.set_posts(entries)
  destination.set_drafts(entries)
  destination.set_pages(entries)
  for (const item of [destination.posts[0], destination.drafts[0], destination.pages[0]]) {
    expect(item.uid).toBe(post_url)
    expect(item.content).toBe('<p>Hello</p>')
  }
  destination.set_posts([{ properties: { ...entries[0].properties, uid: ['urn:entry:abc'] } }])
  expect(destination.posts[0].uid).toBe('urn:entry:abc')
  expect(Post.create({ uid: 123 }).uid).toBe('123')
})

test('preserves Markdown and clears the sending flag when an edit fails', async () => {
  const posting = createPosting()
  applySnapshot(posting, { ...getSnapshot(posting), post_text: '**Hello**', post_url })
  fetch.mockRejectedValueOnce(new Error('Offline'))
  await expect(posting.send_update_post()).resolves.toBe(false)
  expect(posting.is_sending_post).toBe(false)
  await expect(posting.send_update_post()).resolves.toBe(true)
  expect(JSON.parse(fetch.mock.calls[1][1].body).replace.content).toEqual(['**Hello**'])
  expect(App.show_publishing_progress).toHaveBeenCalledWith(false, post_url)
})

const draft_entry = {
  properties: { uid: ['draft'], url: [post_url], content: ['**Draft**'], 'post-status': ['draft'] }
}

test('publishing a draft refreshes both cached post lists', async () => {
  const service = createPosting(true).selected_service
  const destination = service.config.posts_destination()
  destination.set_posts([draft_entry])
  destination.set_drafts([draft_entry])
  axios.get.mockImplementation((url, { params }) => Promise.resolve({ data: { items:
    params['post-status'] === 'draft' ? [] : [{ properties: { ...draft_entry.properties, 'post-status': ['published'] } }]
  } }))

  await expect(service.publish_draft(destination.posts[0])).resolves.toBe(true)

  expect(destination.posts[0].is_draft()).toBe(false)
  expect(destination.drafts).toHaveLength(0)
  expect(axios.get.mock.calls.map(([, { params }]) => params['post-status'])).toEqual([undefined, 'draft'])
})

test('scheduling a draft replaces only its date and status and refreshes both lists', async () => {
  const service = createPosting(true).selected_service
  const published = '2099-06-01T14:30:00.000Z'
  await expect(service.schedule_post({ url: post_url }, published)).resolves.toBe(true)
  expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
    action: 'update', url: post_url, 'mp-destination': 'blog',
    replace: { published: [published], 'post-status': ['published'] }
  })
  expect(axios.get).toHaveBeenCalledTimes(2)
  expect(App.show_toast).toHaveBeenCalledWith('Post was scheduled.')
})

test('failed scheduling keeps cached drafts and does not report success', async () => {
  const service = createPosting(true).selected_service
  const destination = service.config.posts_destination()
  destination.set_posts([draft_entry])
  destination.set_drafts([draft_entry])
  fetch.mockRejectedValueOnce(new Error('Offline'))

  await expect(service.schedule_post({ url: post_url }, '2099-06-01T14:30:00Z')).resolves.toBe(false)

  expect(destination.posts[0].is_draft()).toBe(true)
  expect(destination.drafts).toHaveLength(1)
  expect(axios.get).not.toHaveBeenCalled()
  expect(App.show_toast).not.toHaveBeenCalled()
})

test('new posts retain their content and date until the scheduled editor closes', async () => {
  const posting = createPosting(true)
  const published = '2099-06-01T14:30:00.000Z'
  await posting.handle_post_status_select('draft')
  posting.set_post_published(published)
  expect(posting.is_scheduled()).toBe(true)
  expect(posting.post_status).toBe('published')

  await expect(posting.send_post()).resolves.toBe(true)

  const params = new (require('url').URLSearchParams)(fetch.mock.calls[0][1].body)
  expect(params.get('published')).toBe(published)
  expect(params.get('post-status')).toBe('published')
  expect(App.show_publishing_progress).not.toHaveBeenCalled()
  expect(App.show_toast).toHaveBeenCalledWith('Post was scheduled.')
  expect(posting.post_text).toBe('Hello')
  expect(posting.post_published).toBe(published)
  expect(posting.is_sending_post).toBe(true)
  expect(posting.is_closing_after_post).toBe(true)
  await posting.clear_post()
  expect(posting.post_published).toBeNull()
})

test('editing a draft can schedule it and refresh both lists', async () => {
  const posting = createPosting(true)
  const published = '2099-06-01T14:30:00.000Z'
  await posting.hydrate_post_edit(Post.create({ uid: 'draft', url: post_url, content: '**Draft**', post_status: 'draft', published }))
  expect(posting.is_scheduled()).toBe(false)
  posting.set_post_published(published)
  axios.get.mockClear()

  await expect(posting.send_update_post()).resolves.toBe(true)

  expect(JSON.parse(fetch.mock.calls[0][1].body).replace).toMatchObject({
    content: ['**Draft**'], published: [published], 'post-status': ['published']
  })
  expect(axios.get).toHaveBeenCalledTimes(2)
  expect(App.show_publishing_progress).not.toHaveBeenCalled()
  expect(posting.post_text).toBe('**Draft**')
  expect(posting.post_published).toBe(published)
  expect(posting.is_sending_post).toBe(true)
  expect(posting.is_closing_after_post).toBe(true)
  await posting.clear_post()
  expect(posting.post_published).toBeNull()
})

test('past dates do not schedule, and selecting draft or clearing a post removes scheduling', async () => {
  const posting = createPosting()
  posting.set_post_published('2020-01-01T12:00:00.000Z')
  expect(posting.is_scheduled()).toBe(false)
  posting.set_post_published('2099-06-01T14:30:00.000Z')
  posting.clear_post_published()
  expect(posting.is_scheduled()).toBe(false)
  expect(posting.post_published).toBeNull()
  posting.set_post_published('2099-06-01T14:30:00.000Z')
  await posting.handle_post_status_select('draft')
  expect(posting.post_published).toBeNull()
  posting.set_post_published('2099-06-01T14:30:00.000Z')
  await posting.clear_post()
  expect(posting.post_published).toBeNull()
})

test('posting an existing scheduled post immediately replaces its future date', async () => {
  const posting = createPosting(true)
  await posting.hydrate_post_edit(Post.create({
    uid: 'scheduled', url: post_url, content: 'Scheduled post', post_status: 'published',
    published: '2099-06-01T14:30:00.000Z'
  }))
  expect(posting.original_post_published).toBe('2099-06-01T14:30:00.000Z')
  expect(posting.is_scheduled()).toBe(true)
  posting.clear_post_published()
  expect(posting.is_scheduled()).toBe(false)
  const published = posting.post_published
  expect(Date.parse(published)).toBeLessThanOrEqual(Date.now())
  await posting.send_update_post()
  expect(JSON.parse(fetch.mock.calls[0][1].body).replace.published).toEqual([published])
  await posting.clear_post()
  expect(posting.original_post_published).toBeNull()
})

test('publishing a draft keeps its fields locked through the save and list refresh', async () => {
  const posting = createPosting(true)
  await posting.hydrate_post_edit(Post.create({
    uid: 'draft', url: post_url, name: 'Title', content: '**Draft**', post_status: 'draft'
  }))
  await posting.handle_post_status_select('published')
  let resolve_save
  let resolve_refresh
  jest.spyOn(MicroPubApi, 'post_update').mockImplementation(() => new Promise(resolve => { resolve_save = resolve }))
  axios.get.mockImplementation(() => new Promise(resolve => { resolve_refresh = resolve }))

  const saving = posting.send_update_post()
  expect(posting.is_sending_post).toBe(true)
  expect(posting.post_text).toBe('**Draft**')
  expect(posting.post_title).toBe('Title')

  resolve_save({ url: post_url })
  await Promise.resolve()
  expect(posting.is_sending_post).toBe(true)
  expect(posting.is_closing_after_post).toBe(false)
  expect(posting.post_text).toBe('**Draft**')
  expect(posting.post_title).toBe('Title')

  // Allow the remaining refresh request to finish without clearing the editor.
  axios.get.mockResolvedValue({ data: { items: [] } })
  resolve_refresh({ data: { items: [] } })
  await expect(saving).resolves.toBe(true)
  expect(posting.is_sending_post).toBe(true)
  expect(posting.is_closing_after_post).toBe(true)
  expect(posting.post_text).toBe('**Draft**')
  expect(posting.post_title).toBe('Title')

  await posting.clear_post()
  expect(posting.post_text).toBe('')
  expect(posting.is_sending_post).toBe(false)
  expect(posting.is_closing_after_post).toBe(false)
})
