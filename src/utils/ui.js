import { DynamicColorIOS, Platform } from 'react-native'

export const STANDARD_SLOP = 10

export function isLiquidGlass() {
	return (
		(Platform.OS === 'ios') && (parseInt(Platform.Version, 10) >= 26)
	)
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
