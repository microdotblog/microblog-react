import * as React from 'react'
import { observer } from 'mobx-react'
import { View, Text, TouchableOpacity, Platform } from 'react-native'
import Share from '../../stores/Share'
import App from '../../stores/App'
import { SvgXml } from 'react-native-svg'

@observer
export default class ShareHeaderComponent extends React.Component {
	
	render() {
		const header_base_style = {
			paddingVertical: 15,
			paddingHorizontal: 8,
			borderBottomWidth: 1,
			borderBottomColor: App.theme_border_color(),
			flexDirection: 'row',
			justifyContent: 'space-between'
		}
		
		let header_ios_style = {};
		if ((Platform.OS == 'ios') && (parseInt(Platform.Version, 10) >= 26)) {
			// Liquid Glass
			header_ios_style = {
				marginTop: 3,
				marginLeft: 7,
				marginRight: 7
			}
		}
	
		return (
			<View style={[ header_base_style, Platform.OS == 'ios' && header_ios_style ]}>
				{
					Share.image_options_open ?
					<TouchableOpacity onPress={Share.close_image_options}>
						<SvgXml
							xml={`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="${ App.theme_text_color() }">
									<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
								</svg>`}
							width="24"
							height="24"
						/>
					</TouchableOpacity>
					:
					<TouchableOpacity onPress={Share.close}>
						<SvgXml
							xml={`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="${ App.theme_text_color() }" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`}
							width="24"
							height="24"
						/>
					</TouchableOpacity>
				}
				{
					!Share.image_options_open &&
					<View style={{ marginRight: 5, flexDirection: "row", alignItems: "center" }}>
						{
							Share.can_save_as_bookmark() &&
							<TouchableOpacity style={{marginRight: 22}} onPress={Share.save_as_bookmark}>
								<Text style={{ color: App.theme_accent_color(), fontSize: 17, fontWeight: 400 }}>Save Bookmark</Text>
							</TouchableOpacity>
						}
						<TouchableOpacity onPress={Share.send_post}>
							<Text style={{ color: App.theme_accent_color(), fontSize: 17, fontWeight: 400 }}>Post</Text>
						</TouchableOpacity>
					</View>
				}
			</View>
		)
	}
}
