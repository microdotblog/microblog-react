import { fetchCallsheetMovieLink } from './callsheet'

const url = 'https://callsheetapp.com/movie/791523'
const html = '<!DOCTYPE html><html><head><meta property="og:title" content="Wildwood" /><title>Open Wildwood in Callsheet</title></head><body></body></html>'

beforeEach(() => {
  jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, text: async () => html })
  jest.spyOn(console, 'log').mockImplementation(() => {})
})
afterEach(() => {
  jest.restoreAllMocks()
  jest.useRealTimers()
})

test('uses the movie metadata rather than the Callsheet page title', async () => {
  await expect(fetchCallsheetMovieLink(url)).resolves.toBe(`[Wildwood](${url})`)
  expect(fetch).toHaveBeenCalledWith(url, expect.objectContaining({ credentials: 'omit' }))
})

test('decodes HTML entities and escapes Markdown in the movie name', async () => {
  fetch.mockResolvedValue({ ok: true, text: async () => '<html><head><meta content="Wallace &amp; Gromit [Movie]" property="og:title" /></head></html>' })
  await expect(fetchCallsheetMovieLink(url)).resolves.toBe(`[Wallace & Gromit \\[Movie\\]](${url})`)
})

test('preserves literal asterisks in movie names', async () => {
  fetch.mockResolvedValue({ ok: true, text: async () => '<html><head><meta property="og:title" content="M*A*S*H" /></head></html>' })
  await expect(fetchCallsheetMovieLink(url)).resolves.toBe(`[M\\*A\\*S\\*H](${url})`)
})

test.each([
  undefined, 'Some shared text', 'https://example.com/movie/791523',
  'https://callsheetapp.com.evil.example/movie/791523',
  'http://callsheetapp.com/movie/791523', 'https://callsheetapp.com/tv/791523',
  'https://callsheetapp.com/movie/not-a-number'
])('does not fetch unrelated shares: %p', async value => {
  await expect(fetchCallsheetMovieLink(value)).resolves.toBeNull()
  expect(fetch).not.toHaveBeenCalled()
})

test('leaves the original share available when the page cannot be fetched', async () => {
  fetch.mockRejectedValueOnce(new Error('Offline'))
  await expect(fetchCallsheetMovieLink(url)).resolves.toBeNull()
  fetch.mockResolvedValueOnce({ ok: false, status: 404 })
  await expect(fetchCallsheetMovieLink(url)).resolves.toBeNull()
})

test('does not use a generic page title when movie metadata is missing', async () => {
  fetch.mockResolvedValue({ ok: true, text: async () => '<html><head><title>Open in Callsheet</title></head></html>' })
  await expect(fetchCallsheetMovieLink(url)).resolves.toBeNull()
})

test('times out a stalled request so sharing can continue', async () => {
  jest.useFakeTimers()
  fetch.mockImplementation((_, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(new Error('Aborted')))
  }))
  const lookup = fetchCallsheetMovieLink(url)
  jest.advanceTimersByTime(5000)
  await expect(lookup).resolves.toBeNull()
})
