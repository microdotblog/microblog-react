import {
  normalise_accent_color,
  normalise_theme,
  resolve_app_accent_color,
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

  test('normalises accent colours to hex strings', () => {
    expect(normalise_accent_color('#3366AA')).toBe('#3366aa')
    expect(normalise_accent_color('orange')).toBe('#f80')
    expect(normalise_accent_color(null)).toBe('#f80')
  })

  test('uses Android system accent only when auto theme is enabled', () => {
    expect(resolve_app_accent_color({
      platform_os: 'android',
      auto_android_theme: true,
      system_accent_color: '#3366AA',
    })).toBe('#3366aa')

    expect(resolve_app_accent_color({
      platform_os: 'android',
      auto_android_theme: false,
      system_accent_color: '#3366AA',
    })).toBe('#f80')
  })
})
