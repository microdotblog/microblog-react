import {
  LIQUID_GLASS_WEBVIEW_TAB_BAR_PADDING,
  isLiquidGlass,
  liquidGlassWebViewBottomInset
} from './ui'

describe('ui helpers', () => {
  test('detects Liquid Glass only on iOS 26 and newer', () => {
    expect(isLiquidGlass({ OS: 'ios', Version: '26.0' })).toBe(true)
    expect(isLiquidGlass({ OS: 'ios', Version: '25.4' })).toBe(false)
    expect(isLiquidGlass({ OS: 'android', Version: '26' })).toBe(false)
  })

  test('adds webview bottom padding only for Liquid Glass', () => {
    expect(liquidGlassWebViewBottomInset(34, { OS: 'ios', Version: '26.0' })).toBe(
      34 + LIQUID_GLASS_WEBVIEW_TAB_BAR_PADDING
    )
    expect(liquidGlassWebViewBottomInset(34, { OS: 'ios', Version: '25.4' })).toBe(0)
    expect(liquidGlassWebViewBottomInset(34, { OS: 'android', Version: '26' })).toBe(0)
  })
})
