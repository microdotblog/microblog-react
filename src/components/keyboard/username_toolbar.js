import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, Image, Platform, ScrollView } from 'react-native';
import Auth from '../../stores/Auth';
import PhotoLibrary from '../../assets/icons/toolbar/photo_library.png';
import SettingsIcon from '../../assets/icons/toolbar/settings.png';
import { postingOptionsScreen } from '../../screens';
import App from '../../stores/App';
import { SFSymbol } from 'react-native-sfsymbols';

@observer
export default class UsernameToolbar extends React.Component{
  
	render() {
		const { posting } = Auth.selected_user
		return(
			<View
				style={{
					width: '100%',
					backgroundColor: App.theme_section_background_color(),
					...Platform.select({
						android: {
							position: 'absolute',
							bottom: 0,
							right: 0,
							left: 0,
						}
					}),
					padding: 5,
					minHeight: 40,
					flexDirection: 'row',
					alignItems: 'center'
				}}
			>
				<ScrollView keyboardShouldPersistTaps={'always'}  horizontal={true} style={{overflow: 'hidden', maxWidth: "90%"}} contentContainerStyle={{flexDirection: 'row', alignItems: 'center'}}>
				</ScrollView>
			</View>
		)
	}
	  
}