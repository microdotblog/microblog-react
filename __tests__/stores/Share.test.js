import { applySnapshot } from 'mobx-state-tree'
import { Platform } from 'react-native'
import { ShareMenuReactView } from 'react-native-share-menu'
import Share from '../../src/stores/Share'
import Auth from '../../src/stores/Auth'

jest.mock('react-native-share-menu', () => ({ ShareMenuReactView: { data: jest.fn() } }))
jest.mock('@react-native-async-storage/async-storage', () => ({}))
jest.mock('../../src/api/MicroBlogApi', () => ({}))
jest.mock('../../src/stores/Tokens', () => ({}))
jest.mock('../../src/stores/App', () => ({}))
jest.mock('../../src/stores/Auth', () => ({ users: [] }))
jest.mock('../../src/stores/models/User', () => {
  const { types } = require('mobx-state-tree')
  const Posting = types.model({ post_text: types.optional(types.string, '') })
    .actions(self => ({ set_post_text(text) { self.post_text = text } }))
  return types.model({ username: types.identifier, posting: types.optional(Posting, {}) })
})

const url = 'https://callsheetapp.com/movie/791523'
const movie_link = `[Wildwood](${url})`

beforeEach(() => {
  jest.clearAllMocks()
  jest.spyOn(console, 'log').mockImplementation(() => {})
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true, text: async () => '<html><head><meta property="og:title" content="Wildwood" /></head></html>'
  })
  applySnapshot(Share, { users: [{ username: 'alice' }, { username: 'bob' }], selected_user: 'alice' })
  Auth.users = [{ posting: { set_post_text: jest.fn() } }, { posting: { set_post_text: jest.fn() } }]
})
afterEach(() => jest.restoreAllMocks())

test.each(['ios', 'android'])('formats a Callsheet movie URL for every account on %s', async platform => {
  jest.replaceProperty(Platform, 'OS', platform)
  if (platform === 'ios') {
    ShareMenuReactView.data.mockResolvedValue({ data: [{ data: url, mimeType: 'text/plain' }] })
    await Share.set_data()
    expect(Share.users.map(user => user.posting.post_text)).toEqual([movie_link, movie_link])
  }
  else {
    await Share.set_data({ data: url, mimeType: 'text/plain' })
    for (const user of Auth.users) {
      expect(user.posting.set_post_text).toHaveBeenCalledWith(movie_link)
    }
  }
  expect(Share.share_text).toBe(movie_link)
  expect(Share.share_url).toBe(url)
  expect(Share.can_save_as_bookmark()).toBe(true)
})

test('uses the movie name for Safari shares while preserving selected text', async () => {
  jest.replaceProperty(Platform, 'OS', 'ios')
  ShareMenuReactView.data.mockResolvedValue({ data: [{
    data: JSON.stringify({ title: 'Open Wildwood in Callsheet', url, text: 'Selected text' }),
    mimeType: 'application/json'
  }] })
  await Share.set_data()
  expect(Share.share_text).toBe(`${movie_link}\n\n> Selected text\n\n`)
  expect(Share.users[0].posting.post_text).toBe(Share.share_text)
  expect(Share.share_url).toBe(url)
})

test('keeps the shared URL if the movie lookup fails', async () => {
  fetch.mockRejectedValue(new Error('Offline'))
  await Share.set_data({ data: url, mimeType: 'text/plain' })
  expect(Share.share_text).toBe(url)
  expect(Share.error_message).toBeNull()
})

test('preserves normal links and quoted text without fetching them', async () => {
  await Share.set_data({ data: 'https://example.com/', mimeType: 'text/plain' })
  expect(Share.share_text).toBe('https://example.com/')
  await Share.set_data({ data: 'Shared text', mimeType: 'text/plain' })
  expect(Share.share_text).toBe('> Shared text')
  expect(fetch).not.toHaveBeenCalled()
})
