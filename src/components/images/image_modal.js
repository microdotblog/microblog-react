import * as React from 'react';
import { observer } from 'mobx-react';
import { ImageZoom } from '@likashefqet/react-native-image-zoom';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import App from "../../stores/App"
import { Modal, Platform, SafeAreaView, TouchableOpacity, Image, View } from 'react-native'
import { SFSymbol } from "react-native-sfsymbols";
import ArrowBackIcon from './../../assets/icons/arrow_back.png';

const ImageModalContent = gestureHandlerRootHOC(({ image_url, close_button }) => {
	return (
		<View style={{ flex: 1, backgroundColor: '#000' }}>
			<View style={{ flex: 1 }}>
				<ImageZoom
					uri={image_url}
					style={{ width: '100%', height: '100%' }}
					resizeMode="contain"
					isDoubleTapEnabled={true}
				/>
				{close_button()}
			</View>
		</View>
	)
})

@observer
export default class ImageModalModule extends React.Component{

	close_button = () => {
		return (
			<SafeAreaView style={{ position: 'absolute', left: 15, top: 15 }}>
				<TouchableOpacity onPress={App.reset_image_modal}>
					{
						Platform.OS === 'ios' ?
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
						:
						<Image
							source={ArrowBackIcon}
							resizeMode="center"
							style={{ width: 32, height: 32, tintColor: 'white' }}
						/>
					}
				</TouchableOpacity>
			</SafeAreaView>
		)
	}

	render() {
		return (
			<Modal
				visible={App.image_modal_is_open}
				animationType="fade"
				presentationStyle="fullScreen"
				statusBarTranslucent={true}
				onRequestClose={App.reset_image_modal}
			>
				<ImageModalContent
					image_url={App.current_image_url || ''}
					close_button={this.close_button}
				/>
			</Modal>
		)
	}

}
