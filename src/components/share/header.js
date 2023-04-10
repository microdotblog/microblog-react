import * as React from 'react'
import { observer } from 'mobx-react'
import { View, Text, TouchableOpacity } from 'react-native'
import Share from '../../stores/Share'
import App from '../../stores/App'
import { SvgXml } from 'react-native-svg'

@observer
export default class ShareHeaderComponent extends React.Component {
	
	render() {
		return (
			<View style={{paddingVertical: 15, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: App.theme_border_color() , flexDirection: "row", justifyContent: "space-between"}}>
				<TouchableOpacity onPress={Share.close}>
					<SvgXml
						xml={`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="${ App.theme_text_color() }" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`}
						width="24"
						height="24"
					/>
				</TouchableOpacity>
				<View style={{ marginRight: 5, flexDirection: "row", alignItems: "center" }}>
					{
						Share.can_save_as_bookmark() &&
						<TouchableOpacity style={{marginRight: 22}} onPress={Share.save_as_bookmark}>
							<Text style={{ color: App.theme_accent_color(), fontSize: 16 }}>Save as bookmark</Text>
						</TouchableOpacity>
					}
					<TouchableOpacity onPress={Share.send_post}>
						<Text style={{ color: App.theme_accent_color(), fontSize: 18, fontWeight: 500 }}>Post</Text>
					</TouchableOpacity>
				</View>
			</View>
		)
	}
}