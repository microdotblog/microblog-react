import * as React from 'react';
import { observer } from 'mobx-react';
import ImageView from "react-native-image-viewing";
import App from "../../stores/App"

@observer
export default class ImageModalModule extends React.Component{

	render() {
		if (App.image_modal_is_open) {
			return (
				<ImageView
					images={[ { uri: App.current_image_url }]}
					visible={App.image_modal_is_open}
					onRequestClose={App.reset_image_modal}
					swipeToCloseEnabled={false}
				/>
			)
		}
    return null
  }
  
}