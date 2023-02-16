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
export default class PostToolbar extends React.Component{
  
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
					<TouchableOpacity style={{minWidth: 35}} onPress={() => posting.handle_text_action("**")}>
						<Text style={{ fontSize: 18, fontWeight: '600', textAlign: 'center', padding: 2, color: App.theme_text_color() }}>{"**"}</Text>
					</TouchableOpacity>
					<TouchableOpacity style={{minWidth: 35}} onPress={() => posting.handle_text_action("_")}>
						<Text style={{ fontSize: 18, fontWeight: '600', textAlign: 'center', padding: 2, color: App.theme_text_color() }}>{"_"}</Text>
					</TouchableOpacity>
					<TouchableOpacity style={{minWidth: 35}} onPress={() => posting.handle_text_action("[]")}>
						<Text style={{ fontSize: 18, fontWeight: '600', textAlign: 'center', padding: 2, color: App.theme_text_color() }}>{"[ ]"}</Text>
					</TouchableOpacity>
					{
						!this.props.is_post_edit &&
						<TouchableOpacity style={{minWidth: 35, marginLeft: 8, marginRight: 8}} onPress={posting.handle_asset_action}>
						{
							Platform.OS === 'ios' ?
								<SFSymbol
									name={'photo'}
									color={App.theme_text_color()}
									style={{ height: 22, width: 22 }}
									multicolor={true}
								/>
							: 						
							<Image source={PhotoLibrary} style={{width: 24, height: 24, tintColor: App.theme_text_color()}} />
						}
						</TouchableOpacity>
					}
					{
						!this.props.is_post_edit && posting.selected_service?.config?.active_destination() != null && posting.selected_service?.config?.destination?.length > 1 ?
						<TouchableOpacity style={{marginRight: 8}} onPress={() => postingOptionsScreen(this.props.componentId)}>
							<Text style={{ fontSize: 16, fontWeight: '500', textAlign: 'center', color: App.theme_text_color() }}>
								{posting.selected_service.config.active_destination().name}
							</Text>
						</TouchableOpacity>
						: null
					}
				</ScrollView>
				<View
					style={{
						position: 'absolute',
						right: 8,
						bottom: 9,
						flexDirection: 'row',
						alignItems: 'center',
						backgroundColor: App.theme_section_background_color(),
					}}
				>
					{
						!this.props.is_post_edit &&
						<TouchableOpacity
							onPress={() => postingOptionsScreen(this.props.componentId)}
						>
						{
							Platform.OS === 'ios' ?
								<SFSymbol
									name={'gearshape'}
									color={App.theme_text_color()}
									style={{ height: 22, width: 22 }}
									multicolor={true}
								/>
							: 						
							<Image source={SettingsIcon} style={{width: 24, height: 24, tintColor: App.theme_text_color()}} />
						}
						</TouchableOpacity>
					}
					{
						!posting.post_title &&
						<Text
							style={{
								fontWeight: '400',
								padding: 2,
								color: App.theme_text_color(),
								position: 'absolute',
								top: !this.props.is_post_edit ? -35 : -55,
								right: 0
							}}
						><Text style={{ color: posting.post_text_length() > App.max_characters_allowed ? '#a94442' : App.theme_text_color() }}>{posting.post_text_length()}</Text>/{App.max_characters_allowed}</Text>
					}
				</View>
			</View>
    )
  }
  
}