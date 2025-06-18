import { Platform } from 'react-native';

export function isLiquidGlass() {
	return (
		false
		// (Platform.OS == 'ios') && (parseInt(Platform.Version, 10) >= 26)
	);
}
