import { Platform } from 'react-native';

export const STANDARD_SLOP = 10;

export function isLiquidGlass() {
	return (
		false
		// (Platform.OS == 'ios') && (parseInt(Platform.Version, 10) >= 26)
	);
}
