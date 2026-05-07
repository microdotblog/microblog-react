import {
  is_supported_share_mime_type,
  share_type_for_mime_type
} from './share_intents'

describe('share intent MIME support', () => {
  test('supports text shares for text and URLs', () => {
    expect(share_type_for_mime_type('text/plain')).toBe('text')
    expect(share_type_for_mime_type('text/html')).toBe('text')
    expect(share_type_for_mime_type('text/uri-list')).toBe('text')
    expect(is_supported_share_mime_type('text/plain')).toBe(true)
  })

  test('supports photo shares', () => {
    expect(share_type_for_mime_type('image/jpeg')).toBe('image')
    expect(share_type_for_mime_type('image/png')).toBe('image')
    expect(share_type_for_mime_type('image/heic')).toBe('image')
  })

  test('does not support video shares', () => {
    expect(share_type_for_mime_type('video/mp4')).toBe(null)
    expect(is_supported_share_mime_type('video/mp4')).toBe(false)
  })

  test('does not support arbitrary file shares', () => {
    expect(share_type_for_mime_type('application/pdf')).toBe(null)
    expect(share_type_for_mime_type('application/octet-stream')).toBe(null)
    expect(share_type_for_mime_type('*/*')).toBe(null)
  })
})
