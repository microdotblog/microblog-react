export const DEFAULT_THEME = 'light'

export const normalise_theme = (theme = null) => {
  return theme === 'dark' ? 'dark' : DEFAULT_THEME
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
