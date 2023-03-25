import * as React from 'react'
import { observer } from 'mobx-react'
import { Dimensions, View, Platform } from 'react-native'
import App from '../../stores/App'
import FastImage from 'react-native-fast-image'
import { MenuView } from '@react-native-menu/menu'
import Auth from '../../stores/Auth'

@observer
export default class TempUploadCell extends React.Component {

	constructor (props) {
		super(props)
		this.state = {
			did_load: false
		}
	}

	render() {
		const { upload } = this.props
		const dimension = (Dimensions.get("screen")?.width / 3) - 10
		const actions = upload.did_upload ?
			[
				{
					title: "Copy Link",
					id: "copy_link",
					image: Platform.select({
						ios: 'link'
					})
				},
				{
					title: "Copy HTML",
					id: "copy_html",
					image: Platform.select({
						ios: 'curlybraces'
					})
				},
				{
					title: "Copy Markdown",
					id: "copy_markdown",
					image: Platform.select({
						ios: 'textformat'
					})
				},
				{
					title: "Open in Browser",
					id: "open_in_browser",
					image: Platform.select({
						ios: 'safari'
					})
				},
				{
					title: "Delete...",
					id: "delete",
					image: Platform.select({
						ios: 'trash'
					}),
					attributes: {
						destructive: true
					}
				}
			]
			:
			[
				{
					title: "Cancel upload",
					id: "cancel",
					image: Platform.select({
						ios: 'trash'
					}),
					attributes: {
						destructive: true
					}
				}
			]
		return (
			<MenuView
				style={{
					padding: 5,
					backgroundColor: App.theme_background_color_secondary()
				}}
				onPressAction={({ nativeEvent }) => {
					const event_id = nativeEvent.event
					if (event_id === "copy_link") {
						upload.copy_link_to_clipboard()
					}
					else if (event_id === "copy_html") {
						upload.copy_html_to_clipboard()
					}
					else if (event_id === "copy_markdown") {
						upload.copy_markdown_to_clipboard()
					}
					else if (event_id === "open_in_browser") {
						App.open_url(upload.url)
					}
					else if (event_id === "delete") {
						Auth.selected_user.posting.selected_service?.trigger_upload_delete(upload)
					}
					else if (event_id === "cancel") {
						upload.cancel_upload()
					}
				}}
				actions={actions}
			>
				<FastImage
					key={upload.uri}
					source={{
						uri: upload.uri,
						priority: FastImage.priority.high
					}}
					resizeMode={FastImage.resizeMode.cover}
					style={{
						width: dimension,
						height: dimension,
						borderWidth: 2,
						borderColor: App.theme_placeholder_text_color(),
						borderRadius: 5
					}}
				/>
			</MenuView>
		)
	}

}