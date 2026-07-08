// Documents CustomToolbar.kt top-inset resolution (SafeArea may consume statusBars).
function resolve_android_toolbar_top_inset({
  should_apply_top_inset = false,
  unhandled_status_bar_top = 0,
  decor_view_top = 0,
} = {}) {
  if (!should_apply_top_inset) {
    return 0
  }

  if (unhandled_status_bar_top > 0) {
    return unhandled_status_bar_top
  }

  return Math.max(0, decor_view_top)
}

describe('resolve_android_toolbar_top_inset', () => {
  test('returns 0 when top inset should not be applied', () => {
    expect(resolve_android_toolbar_top_inset({
      should_apply_top_inset: false,
      unhandled_status_bar_top: 0,
      decor_view_top: 48,
    })).toBe(0)
  })

  test('prefers unhandled status bar inset when present', () => {
    expect(resolve_android_toolbar_top_inset({
      should_apply_top_inset: true,
      unhandled_status_bar_top: 24,
      decor_view_top: 48,
    })).toBe(24)
  })

  test('falls back to DecorView inset when SafeArea consumed status bars', () => {
    expect(resolve_android_toolbar_top_inset({
      should_apply_top_inset: true,
      unhandled_status_bar_top: 0,
      decor_view_top: 48,
    })).toBe(48)
  })
})
