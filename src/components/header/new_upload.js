import * as React from 'react'
import { observer } from 'mobx-react'
import { Image, Platform } from 'react-native'
import Auth from './../../stores/Auth'
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
						if (event_id === 'upload_media') {
							console.log('upload_media')
							Auth.selected_user.posting.selected_service?.config?.temporary_destination()?.pick_image()
						} else if (event_id === 'upload_file') {
							console.log('upload_file')
							Auth.selected_user.posting.selected_service?.config?.temporary_destination()?.pick_file()
						}
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