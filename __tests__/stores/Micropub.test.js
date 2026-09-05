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
      config: { 'media-endpoint': media, destination: [{ uid: 'blog', syndicates: [{ uid: 'a', name: 'A' }, { uid: 'b', name: 'B' }] }] }
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
  axios.get.mockResolvedValue({ data: {} })
  App.show_publishing_progress.mockClear()
})
afterEach(() => jest.restoreAllMocks())

test('initializes a generic destination and keeps standard syndication targets', async () => {
  const posting = createPosting()
  const service = posting.selected_service
  const targets = [{ uid: 'social.example/user', name: 'Social' }]
  await service.set_initial_config({ 'media-endpoint': media_endpoint, 'syndicate-to': targets })
  expect(service.active_destination().uid).toBe(endpoint)
  expect(getSnapshot(service.active_destination().syndicates)).toEqual(targets)
  expect(service.service_object()).toMatchObject({ is_microblog: false, media_endpoint })
  await service.set_initial_config({})
  expect(service.active_destination()).not.toBeNull()
})

test('keeps existing configuration when refresh fails', async () => {
  const service = createPosting().selected_service
  const config = getSnapshot(service.config)
  fetch.mockRejectedValue(new Error('Offline'))
  await service.hydrate()
  expect(getSnapshot(service.config)).toEqual(config)
})

test('sends all selected syndication targets and uses the external post URL', async () => {
  const posting = createPosting()
  await expect(posting.send_post()).resolves.toBe(true)
  const params = new (require('url').URLSearchParams)(fetch.mock.calls[0][1].body)
  expect(params.getAll('mp-syndicate-to[]')).toEqual(['a', 'b'])
  expect(App.show_publishing_progress).toHaveBeenCalledWith(false, post_url)
})

test('clears the sending flag and preserves the draft when the network fails', async () => {
  const posting = createPosting()
  fetch.mockRejectedValue(new Error('Offline'))
  await expect(posting.send_post()).resolves.toBe(false)
  expect(posting.is_sending_post).toBe(false)
  expect(posting.post_text).toBe('Hello')
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
