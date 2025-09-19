import { Platform } from 'react-native';

export const STANDARD_SLOP = 7;

export function isLiquidGlass() {
	return (
		(Platform.OS == 'ios') && (parseInt(Platform.Version, 10) >= 26)
	);
}
