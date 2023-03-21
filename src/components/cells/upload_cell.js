import * as React from 'react'
import { observer } from 'mobx-react'
import { TouchableOpacity } from 'react-native'
import App from '../../stores/App'
import FastImage from 'react-native-fast-image'

@observer
export default class UploadCell extends React.Component {

	render() {
		const { upload } = this.props
		return (
			<TouchableOpacity
				style={{
					padding: 15,
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
					style={{ width: 165, height: 165, borderRadius: 2 }}
				/>
			</TouchableOpacity>
		)
	}

}