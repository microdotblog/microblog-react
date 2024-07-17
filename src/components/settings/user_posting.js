import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import App from '../../stores/App'
import Auth from '../../stores/Auth';
import { SvgXml } from 'react-native-svg';
import { postOptionsSettingsScreen } from '../../screens';

@observer
export default class UserPostingSettings extends React.Component{
	
	render() {
		const { user, index } = this.props
    return(
			<View
				style={{ 
					width: "100%", 
					flexDirection: "column", 
					paddingVertical: 10,
					borderBottomWidth: Auth.users.length - 1 !== index ? 1 : 0, 
					borderColor: App.theme_border_color()
				}}
			>
				<View
					style={{
						flexDirection: "row",
						justifyContent: "space-between", 
						alignItems: "center", 
					}}
				>
					<View style={{flexDirection: "row", alignItems: "center"}}>
						<FastImage
							source={{
								uri: `${user.avatar}?v=${App.now()}`,
								priority: FastImage.priority.normal,
								cache: FastImage.cacheControl.web
							}}
							resizeMode={FastImage.resizeMode.contain}
							style={{ width: 24, height: 24, borderRadius: 50, marginRight: 8 }}
						/>
					</View>
					<TouchableOpacity onPress={() => App.navigate_to_screen("post_service", user)} style={{flexDirection: "row", alignItems: "center"}}>
						<Text style={{ color: App.theme_text_color(), marginRight: 5 }}>{user.posting?.selected_service?.description()}</Text>
						<SvgXml
							xml={`
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="transparent" strokeWidth="2" stroke="${App.theme_text_color()}" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
								</svg>
							`} 
						/>
					</TouchableOpacity>
				</View>
			</View>
    )
  }
  
}