import * as React from 'react'
import { observer } from 'mobx-react'
import { TouchableOpacity, Dimensions } from 'react-native'
import App from '../../stores/App'
import FastImage from 'react-native-fast-image'

@observer
export default class UploadCell extends React.Component {

	render() {
		const { upload } = this.props
		const dimension = (Dimensions.get("screen")?.width / 3) - 10
		return (
			<TouchableOpacity
				style={{
					padding: 5,
					backgroundColor: App.theme_background_color_secondary()
				}}
				onPress={() => upload.copy_link_to_clipboard()}
				onLongPress={() => upload.copy_html_to_clipboard()}
			>
				<FastImage
					key={upload.url}
					source={{
						uri: upload.url,
						priority: FastImage.priority.normal,
						cache: FastImage.cacheControl.web
					}}
					resizeMode={FastImage.resizeMode.cover}
					style={{
						width: dimension,
						height: dimension,
						borderWidth: upload.is_video() ? 2 : 0,
						borderColor: App.theme_placeholder_text_color(),
						borderRadius: 5
					}}
				/>
			</TouchableOpacity>
		)
	}

}