import {
  build_webview_source_uri,
} from './webview_recovery'

describe('web view recovery', () => {
  test('opts the initial hybrid sign-in session into plain JavaScript', () => {
    const uri = build_webview_source_uri({
      did_load_one_or_more_webviews: false,
      endpoint: 'hybrid/posts',
      theme: 'dark',
      token: 'test token',
      web_url: 'https://micro.blog',
    })

    expect(uri).toContain('/hybrid/signin?')
    expect(uri).toContain('plainjs=1')
    expect(uri).toContain('token=test%20token')
  })

  test('does not add the capability to later hybrid requests', () => {
    const uri = build_webview_source_uri({
      did_load_one_or_more_webviews: true,
      endpoint: 'hybrid/posts',
      theme: 'light',
      token: 'test-token',
      web_url: 'https://micro.blog',
    })

    expect(uri).toBe('https://micro.blog/hybrid/posts?theme=light&show_actions=true&fontsize=17')
  })
})
