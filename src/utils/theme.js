export const DEFAULT_THEME = 'light'
export const DEFAULT_ACCENT_COLOR = '#f80'

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

export const should_follow_system_theme = ({
  platform_os = '',
  auto_android_theme = true,
}) => {
  return platform_os !== 'android' || auto_android_theme
}

export const resolve_app_theme = ({
  platform_os = '',
  system_theme = null,
  auto_android_theme = true,
}) => {
  if (!should_follow_system_theme({ platform_os, auto_android_theme })) {
    return DEFAULT_THEME
  }

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
