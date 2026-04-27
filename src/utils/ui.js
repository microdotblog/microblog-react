import { DynamicColorIOS, Platform } from 'react-native'

export const STANDARD_SLOP = 10
export const LIQUID_GLASS_WEBVIEW_TAB_BAR_PADDING = 56

export function isLiquidGlass(platform = Platform) {
  return (
    (platform.OS === 'ios') && (parseInt(platform.Version, 10) >= 26)
  )
}

export function liquidGlassWebViewBottomInset(bottom_safe_area_inset = 0, platform = Platform) {
  if (!isLiquidGlass(platform)) {
    return 0
  }

  return bottom_safe_area_inset + LIQUID_GLASS_WEBVIEW_TAB_BAR_PADDING
}

export function liquidGlassTintColor() {
	if (Platform.OS === 'ios') {
		return DynamicColorIOS({
			dark: 'white',
			light: 'black'
		})
	}

	return undefined
}
