import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import Auth from '../../stores/Auth';
import PhotoLibrary from '../../assets/icons/toolbar/photo_library.png';
import SettingsIcon from '../../assets/icons/toolbar/settings.png';
import { postingOptionsScreen } from '../../screens';

@observer
export default class PostToolbar extends React.Component{
  
	render() {
		const { posting } = Auth.selected_user
    return(
      <View
				style={{
					width: '100%',
					backgroundColor: '#E5E7EB',
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
				<TouchableOpacity style={{minWidth: 35}} onPress={() => posting.handle_text_action("**")}>
					<Text style={{ fontSize: 20, fontWeight: '700', textAlign: 'center', padding: 2 }}>{"**"}</Text>
				</TouchableOpacity>
				<TouchableOpacity style={{minWidth: 35}} onPress={() => posting.handle_text_action("_")}>
					<Text style={{ fontSize: 20, fontWeight: '800', textAlign: 'center', padding: 2 }}>{"_"}</Text>
				</TouchableOpacity>
				<TouchableOpacity style={{minWidth: 35}} onPress={() => posting.handle_text_action("[]")}>
					<Text style={{ fontSize: 20, fontWeight: '600', textAlign: 'center', padding: 2 }}>{"[ ]"}</Text>
				</TouchableOpacity>
				<TouchableOpacity style={{minWidth: 35, marginLeft: 8, marginRight: 8}} onPress={posting.handle_image_action}>
					<Image source={PhotoLibrary} style={{width: 24, height: 24}} />
				</TouchableOpacity>
				<View
					style={{
						position: 'absolute',
						right: 8,
						bottom: 9,
						flexDirection: 'row',
						alignItems: 'center'
					}}
				>
					<TouchableOpacity
						onPress={() => postingOptionsScreen(this.props.componentId)}
						style={{
							marginRight: 8,
						}}
					>
						<Image source={SettingsIcon} style={{width: 24, height: 24}} />
					</TouchableOpacity>
					<Text
						style={{
							fontWeight: '200',
							padding: 2,
							backgroundColor: 'rgba(255,255,255,.6)'
						}}
					><Text style={{ color: posting.post_text_length() > 280 ? '#a94442' : 'black' }}>{posting.post_text_length()}</Text>/280</Text>
				</View>
			</View>
    )
  }
  
}