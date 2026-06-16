import {
  ANDROID_TAB_BAR_PADDING,
  IOS_TAB_BAR_PADDING,
  LIQUID_GLASS_WEBVIEW_TAB_BAR_PADDING,
  isLiquidGlass,
  tabBarBottomInset,
  tabBarScrollContentBottomPadding,
} from './ui'

describe('UI inset helpers', () => {
  test('adds the classic iOS tab bar height before Liquid Glass', () => {
    const platform = { OS: 'ios', Version: '18.5' }

    expect(isLiquidGlass(platform)).toBe(false)
    expect(tabBarBottomInset(0, platform)).toBe(IOS_TAB_BAR_PADDING)
    expect(tabBarBottomInset(34, platform)).toBe(34 + IOS_TAB_BAR_PADDING)
  })

  test('uses the Liquid Glass tab bar height on iOS 26 and newer', () => {
    const platform = { OS: 'ios', Version: '26.0' }

    expect(isLiquidGlass(platform)).toBe(true)
    expect(tabBarBottomInset(34, platform)).toBe(34 + LIQUID_GLASS_WEBVIEW_TAB_BAR_PADDING)
  })

  test('keeps Android tab padding unchanged', () => {
    const platform = { OS: 'android', Version: 35 }

    expect(tabBarBottomInset(0, platform)).toBe(ANDROID_TAB_BAR_PADDING)
  })

  test('adds base scroll padding to the tab bar inset', () => {
    const platform = { OS: 'ios', Version: '18.5' }

    expect(tabBarScrollContentBottomPadding(0, 10, platform)).toBe(10 + IOS_TAB_BAR_PADDING)
  })
})
