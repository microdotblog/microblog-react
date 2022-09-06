import * as React from 'react';
import { observer } from 'mobx-react';
import ImageView from "react-native-image-viewing";
import App from "../../stores/App"
import { Platform, SafeAreaView, TouchableOpacity } from 'react-native'
import { SFSymbol } from "react-native-sfsymbols";

@observer
export default class ImageModalModule extends React.Component{

	close_button = () => {
		return (
			<SafeAreaView style={{ position: 'absolute', left: 15, top: 15 }}>
				<TouchableOpacity onPress={App.reset_image_modal}>
					<SFSymbol
						name="xmark"
						weight="semibold"
						scale="large"
						color="white"
						size={16}
						resizeMode="center"
						multicolor={false}
						style={{ width: 32, height: 32 }}
					/>
				</TouchableOpacity>
			</SafeAreaView>
		)
	}

	render() {
		if (App.image_modal_is_open) {
			return (
				<ImageView
					images={[ { uri: App.current_image_url } ]}
					visible={App.image_modal_is_open}
					onRequestClose={App.reset_image_modal}
					swipeToCloseEnabled={false}
					HeaderComponent={Platform.OS === 'ios' ? () => this.close_button() : null}
				/>
			)
		}
    return null
  }
  
}