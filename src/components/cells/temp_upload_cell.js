import * as React from 'react'
import { observer } from 'mobx-react'
import { Dimensions, View, Platform } from 'react-native'
import App from '../../stores/App'
import FastImage from 'react-native-fast-image'
import { MenuView } from '@react-native-menu/menu'

@observer
export default class TempUploadCell extends React.Component {

	render() {
		const { upload } = this.props
		const dimension = (Dimensions.get("screen")?.width / 4) - 10
		const actions = [
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
					if (event_id === "cancel") {
						upload.cancel_upload()
					}
				}}
				actions={actions}
			>
				<View
					style={{
						width: dimension,
						height: dimension,
						position: "relative"
					}}
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
					{
						upload.is_uploading &&
						<View
							style={{
								width: `${ upload.progress }%`,
								height: 5,
								backgroundColor: App.theme_accent_color(),
								position: 'absolute',
								left: 0,
								bottom: 0,
								borderBottomLeftRadius: 2,
								borderBottomRightRadius: upload.progress === 100 ? 2 : 0,
								zIndex: 2
							}}
						/>
					}
				</View>
			</MenuView>
		)
	}

}