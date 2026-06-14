import * as React from 'react'
import { observer } from 'mobx-react'
import { Image, Platform } from 'react-native'
import Auth from './../../stores/Auth'
import App from '../../stores/App'
import { SFSymbol } from "react-native-sfsymbols"
import { MenuView } from '@react-native-menu/menu';
import AddIcon from './../../assets/icons/add.png'
import { isLiquidGlass } from './../../utils/ui'

@observer
export default class NewUploadButton extends React.Component {

	render() {
		if (Auth.selected_user != null && Auth.selected_user.posting?.posting_enabled()) {
			const { config } = Auth.selected_user.posting.selected_service
			const icon_color = App.theme_text_color()
			const button_style = isLiquidGlass() ?
				{
					width: 28,
					height: 28,
					alignItems: 'center',
					justifyContent: 'center'
				}
				:
				undefined

			return (
				<MenuView
					style={button_style}
					onPressAction={({ nativeEvent }) => {
						const event_id = nativeEvent.event
						if (event_id === 'upload_media') {
							console.log('upload_media')
							Auth.selected_user.posting.selected_service?.pick_image(config?.temporary_destination())
						} else if (event_id === 'upload_file') {
							console.log('upload_file')
							Auth.selected_user.posting.selected_service?.pick_file(config?.temporary_destination())
						}
					}}
					actions={[
						{
							title: "Photo library",
							id: "upload_media",
							image: Platform.select({
								ios: 'photo'
							}),
							imageColor: icon_color
						},
						{
							title: "Files",
							id: "upload_file",
							image: Platform.select({
								ios: 'folder'
							}),
							imageColor: icon_color
						}
					]}
					accessibilityRole="button"
					accessibilityLabel="Upload"
					accessibilityHint="Shows photo library and files options"
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
								style={{ width: 28, height: 28, tintColor: App.theme_text_color(), marginRight: 5 }}
							/>
					}
				</MenuView>
			)
		}
		return null
	}

}
