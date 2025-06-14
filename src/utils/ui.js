import { Platform } from 'react-native';

export function isLiquidGlass() {
	return (
		(Platform.OS == 'ios') && (parseInt(Platform.Version, 10) >= 26)
	);
}
