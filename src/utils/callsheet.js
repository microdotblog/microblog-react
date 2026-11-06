import { DOMParser } from '@xmldom/xmldom'

export async function fetchCallsheetMovieLink(url) {
  if (typeof url !== 'string' || !/^https:\/\/callsheetapp\.com\/movie\/\d+\/?$/.test(url)) {
    return null
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)
  try {
    const response = await fetch(url, {
      headers: { Accept: 'text/html' },
      credentials: 'omit',
      signal: controller.signal
    })
    if (!response.ok) {
      return null
    }
    const html = await response.text()
    const document = new DOMParser().parseFromString(html, 'text/html')
    const metadata = document.getElementsByTagName('meta')
    for (let i = 0; i < metadata.length; i++) {
      if (metadata[i].getAttribute('property') === 'og:title') {
        const title = metadata[i].getAttribute('content')?.trim()
        if (title) {
          return `[${title.replace(/([\\[\]*_`<>])/g, '\\$1')}](${url})`
        }
      }
    }
    return null
  }
  catch (error) {
    console.log('Share:fetchCallsheetMovieLink', error)
    return null
  }
  finally {
    clearTimeout(timeout)
  }
}
