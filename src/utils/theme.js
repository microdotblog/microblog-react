export const DEFAULT_THEME = 'light'
export const DEFAULT_ACCENT_COLOR = '#f80'

// Matches Build.VERSION_CODES.VANILLA_ICE_CREAM in CustomToolbar.kt.
export const ANDROID_EDGE_TO_EDGE_API = 35

export const normalise_theme = (theme = null) => {
  return theme === 'dark' ? 'dark' : DEFAULT_THEME
}

export const normalise_accent_color = (color = null) => {
  if (typeof color !== 'string') {
    return DEFAULT_ACCENT_COLOR
  }

  if (/^#[0-9a-fA-F]{6}$/.test(color)) {
    return color.toLowerCase()
  }

  return DEFAULT_ACCENT_COLOR
}

export const should_follow_system_theme = () => {
  return true
}

export const resolve_app_theme = ({
  system_theme = null,
}) => {
  return normalise_theme(system_theme)
}

export const resolve_app_accent_color = ({
  platform_os = '',
  auto_android_theme = true,
  system_accent_color = null,
}) => {
  if (platform_os === 'android' && auto_android_theme) {
    return normalise_accent_color(system_accent_color)
  }

  return DEFAULT_ACCENT_COLOR
}

// react-native-screens statusBarStyle: light icons on dark chrome, dark icons on light.
export const android_status_bar_style = (is_dark = false) => {
  return is_dark ? 'light' : 'dark'
}

// Must stay in sync with CustomToolbar.kt shouldApplyTopInset.
export const should_use_android_translucent_status_bar = ({
  platform_os = '',
  platform_version = 0,
  edge_to_edge_enabled = false,
} = {}) => {
  if (platform_os !== 'android') {
    return false
  }

  return platform_version >= ANDROID_EDGE_TO_EDGE_API || edge_to_edge_enabled
}
