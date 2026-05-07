import { DEFAULT_THEME, normalise_theme } from './theme'

export { normalise_theme }

const decode_query_value = (value = '') => {
  return decodeURIComponent(`${value}`.replace(/\+/g, ' '))
}

const parse_query_params = (query = '') => {
  if (!query) {
    return []
  }

  return query
    .split('&')
    .filter(Boolean)
    .map(part => {
      const [raw_key, ...raw_value_parts] = part.split('=')

      return [
        decode_query_value(raw_key),
        decode_query_value(raw_value_parts.join('=')),
      ]
    })
}

const has_query_param = (params = [], key = '') => {
  return params.some(([current_key]) => current_key === key)
}

const set_query_param = (params = [], key = '', value = '') => {
  const next_params = []
  let did_set = false

  params.forEach(([current_key, current_value]) => {
    if (current_key === key) {
      if (!did_set) {
        next_params.push([key, value])
        did_set = true
      }

      return
    }

    next_params.push([current_key, current_value])
  })

  if (!did_set) {
    next_params.push([key, value])
  }

  return next_params
}

const serialise_query_params = (params = []) => {
  return params
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(`${value}`)}`)
    .join('&')
}

export const get_base_webview_path = (url_or_endpoint = '') => {
  let path = `${url_or_endpoint}`.replace(/^https?:\/\/[^\/]+/, '')
  path = path.replace(/^\//, '')
  path = path.split('?')[0].split('#')[0]
  return path
}

export const is_signin_webview_path = (url_or_endpoint = '') => {
  return get_base_webview_path(url_or_endpoint) === 'hybrid/signin'
}

export const is_webview_endpoint_url = ({ endpoint = '', url = '' }) => {
  return get_base_webview_path(endpoint) === get_base_webview_path(url)
}

export const should_remount_webview_on_android_resume = ({
  next_app_state = '',
  platform_os = '',
  previous_app_state = '',
  system_theme = null,
  theme = DEFAULT_THEME,
}) => {
  if (platform_os !== 'android') {
    return false
  }

  if (next_app_state !== 'active') {
    return false
  }

  if (previous_app_state !== 'background' && previous_app_state !== 'inactive') {
    return false
  }

  return normalise_theme(system_theme) !== normalise_theme(theme)
}

export const invalidate_webview_bootstrap_state = (target = null) => {
  if (target != null) {
    target.did_load_one_or_more_webviews = false
  }

  return target
}

export const build_webview_endpoint = ({
  endpoint = '',
  theme = DEFAULT_THEME,
}) => {
  const hash_parts = `${endpoint}`.split('#')
  const path_and_query = hash_parts[0] ?? ''
  const hash = hash_parts.length > 1 ? `#${hash_parts.slice(1).join('#')}` : ''
  const query_index = path_and_query.indexOf('?')
  const path = query_index > -1 ? path_and_query.slice(0, query_index) : path_and_query
  const query = query_index > -1 ? path_and_query.slice(query_index + 1) : ''
  let params = parse_query_params(query)

  params = set_query_param(params, 'theme', normalise_theme(theme))

  if (!hash) {
    if (!has_query_param(params, 'show_actions')) {
      params.push(['show_actions', 'true'])
    }

    if (!has_query_param(params, 'fontsize')) {
      params.push(['fontsize', '17'])
    }
  }

  const query_string = serialise_query_params(params)

  return `${path}${query_string ? `?${query_string}` : ''}${hash}`
}

export const build_webview_source_uri = ({
  did_load_one_or_more_webviews = false,
  endpoint = '',
  theme = DEFAULT_THEME,
  token = '',
  web_url = '',
}) => {
  const prepared_endpoint = build_webview_endpoint({ endpoint, theme })

  if (did_load_one_or_more_webviews) {
    return `${web_url}/${prepared_endpoint}`
  }

  const query_string = serialise_query_params([
    ['token', token],
    ['redirect_to', prepared_endpoint],
    ['theme', normalise_theme(theme)],
    ['show_actions', 'true'],
  ])

  return `${web_url}/hybrid/signin?${query_string}`
}

export const should_attempt_webview_recovery = ({
  did_load_one_or_more_webviews = false,
  has_attempted_recovery = false,
  url = '',
}) => {
  if (!did_load_one_or_more_webviews || has_attempted_recovery) {
    return false
  }

  return !is_signin_webview_path(url)
}
