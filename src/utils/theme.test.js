import {
  normalise_theme,
  resolve_app_theme,
  should_follow_system_theme,
} from './theme'

describe('theme resolution', () => {
  test('normalises unsupported system themes to the default light theme', () => {
    expect(normalise_theme('dark')).toBe('dark')
    expect(normalise_theme('light')).toBe('light')
    expect(normalise_theme(null)).toBe('light')
    expect(normalise_theme('no-preference')).toBe('light')
  })

  test('follows the Android system theme when auto theme is enabled', () => {
    expect(resolve_app_theme({
      platform_os: 'android',
      system_theme: 'dark',
      auto_android_theme: true,
    })).toBe('dark')
  })

  test('uses the default theme on Android when auto theme is disabled', () => {
    expect(should_follow_system_theme({
      platform_os: 'android',
      auto_android_theme: false,
    })).toBe(false)
    expect(resolve_app_theme({
      platform_os: 'android',
      system_theme: 'dark',
      auto_android_theme: false,
    })).toBe('light')
  })

  test('keeps non-Android platforms following the system theme', () => {
    expect(resolve_app_theme({
      platform_os: 'ios',
      system_theme: 'dark',
      auto_android_theme: false,
    })).toBe('dark')
  })
})
