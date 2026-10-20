import axios from 'axios'

import MicroBlogApi, { API_ERROR } from '../../src/api/MicroBlogApi'

jest.mock('axios', () => ({
  defaults: {},
  post: jest.fn()
}))

jest.mock('../../src/stores/Auth', () => ({
  selected_user: null
}))

describe('MicroBlogApi Apple sign in', () => {
  beforeEach(() => {
    axios.post.mockReset()
  })

  test('posts Apple credentials and returns verified account data', async () => {
    axios.post.mockResolvedValue({
      data: {
        username: 'vincent',
        token: 'app-token'
      }
    })

    const result = await MicroBlogApi.login_with_apple({
      user_id: 'apple-user-id',
      identity_token: 'apple-identity-token',
      email: 'vincent@example.com',
      full_name: 'Vincent Ritter'
    })

    expect(axios.post).toHaveBeenCalledWith(
      '/account/apple',
      expect.any(FormData)
    )
    const form = axios.post.mock.calls[0][1]
    expect(form.get('user_id')).toBe('apple-user-id')
    expect(form.get('identity_token')).toBe('apple-identity-token')
    expect(form.get('email')).toBe('vincent@example.com')
    expect(form.get('full_name')).toBe('Vincent Ritter')
    expect(form.get('app_name')).toBe('Micro.blog for iOS')
    expect(result).toEqual({
      username: 'vincent',
      token: 'app-token'
    })
  })

  test('returns Apple account error responses', async () => {
    axios.post.mockResolvedValue({
      data: {
        error: 'That username is not available.'
      }
    })

    const result = await MicroBlogApi.login_with_apple({
      user_id: 'apple-user-id',
      identity_token: 'apple-identity-token',
      username: 'vincent'
    })

    expect(result).toEqual({
      error: 'That username is not available.'
    })
  })
})

describe('Post conversation lookup', () => {
  beforeEach(() => {
    jest.spyOn(global, 'fetch')
    jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => jest.restoreAllMocks())

  test('resolves a blog URL to the root timeline ID, independently of reply IDs', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ home_page_url: 'https://micro.blog/alice/12345', items: [{ id: '67890' }] })
    })
    const post_url = 'https://alice.example/post.html?one=1&two=2'
    await expect(MicroBlogApi.get_conversation_id_for_url(post_url)).resolves.toBe('12345')
    const url = new URL(fetch.mock.calls[0][0])
    expect(url.origin + url.pathname).toBe('https://micro.blog/conversation.js')
    expect(url.searchParams.get('url')).toBe(post_url)
    expect(url.searchParams.get('format')).toBe('jsonfeed')
  })

  test('can open the root post when it has no replies', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => ({ home_page_url: 'https://micro.blog/alice/12345', items: [] }) })
    await expect(MicroBlogApi.get_conversation_id_for_url('https://alice.example/post.html')).resolves.toBe('12345')
  })

  test.each([undefined, 'not a URL', 'https://elsewhere.example/alice/12345', 'https://micro.blog/alice/zero', 'https://micro.blog/alice/0'])('rejects an invalid conversation URL %p', async home_page_url => {
    fetch.mockResolvedValue({ ok: true, json: async () => ({ home_page_url }) })
    await expect(MicroBlogApi.get_conversation_id_for_url('https://alice.example/post.html')).resolves.toBe(API_ERROR)
  })

  test('distinguishes a missing conversation from a failed request', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 404 }).mockResolvedValueOnce({ ok: false, status: 500 })
    await expect(MicroBlogApi.get_conversation_id_for_url('https://alice.example/post.html')).resolves.toBeNull()
    await expect(MicroBlogApi.get_conversation_id_for_url('https://alice.example/post.html')).resolves.toBe(API_ERROR)
  })

  test('handles network failures', async () => {
    fetch.mockRejectedValue(new Error('Offline'))
    await expect(MicroBlogApi.get_conversation_id_for_url('https://alice.example/post.html')).resolves.toBe(API_ERROR)
  })
})
