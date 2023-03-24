import * as React from 'react'
import { observer } from 'mobx-react'
import { TouchableOpacity, Image, Platform } from 'react-native'
import Auth from './../../stores/Auth'
import { postingScreen } from './../../screens'
import App from '../../stores/App'
import { SFSymbol } from "react-native-sfsymbols"
import { MenuView } from '@react-native-menu/menu';
import AddIcon from './../../assets/icons/add.png'

@observer
export default class NewUploadButton extends React.Component {

	render() {
		if (Auth.selected_user != null && Auth.selected_user.posting?.posting_enabled()) {
			return (
				<MenuView
					onPressAction={({ nativeEvent }) => {
						const event_id = nativeEvent.event
						console.log(event_id)
					}}
					actions={[
						{
							title: "Photo library",
							id: "upload_media",
							image: Platform.select({
								ios: 'photo'
							})
						},
						{
							title: "Files",
							id: "upload_file",
							image: Platform.select({
								ios: 'folder'
							})
						}
					]}
				>
					{
						Platform.OS === 'ios' ? 
							<SFSymbol
								name="icloud.and.arrow.up"
								color={App.theme_text_color()}
								style={{ width: 28, height: 28 }}
							/>
							:
							<Image
								source={AddIcon}
								style={{ width: 28, height: 28 }}
							/>
					}
				</MenuView>
			)
		}
		return null
	}

}