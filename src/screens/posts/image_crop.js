import * as React from 'react';
import { observer } from 'mobx-react';
import { ScrollView, View, Text, Image, useWindowDimensions } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { Screens, POSTING_SCREEN } from '../../screens';

@observer
export default class ImageCropScreen extends React.Component{
	
	constructor (props) {
		super(props)
		this.state = {
			scroll_size: 0
		}
		Navigation.events().bindComponent(this)
	}

	navigationButtonPressed = async ({ buttonId }) => {
		console.log("navigationButtonPressed::", buttonId)
		if (buttonId === "add_image_button") {
			Auth.selected_user.posting.attach_asset(this.props.asset)
			Navigation.pop(POSTING_SCREEN)
		}
	}
  
	render() {
		const { scroll_size } = this.state
		const { asset } = this.props
		return (
			<View style={{ flex: 1, flexDirection: "column" }}>
				<View style={{ flex: 1, flexDirection: "row" }}>
					<ScrollView style={{ width: "100%", height: scroll_size }} bounces={ false } contentContainerStyle={{ width: asset.scale_width_for_height(scroll_size), height: scroll_size }} onLayout={(e) => {
						this.setState({ scroll_size: e.nativeEvent.layout.width })
					}}>
						<Image source={{ uri: asset.uri }} style={{ width: asset.scale_width_for_height(scroll_size), height: scroll_size, resizeMode: "contain" }} />
					</ScrollView>
				</View>
				<Text style={{ height: 100, color: "#FFF" }}>Testing.</Text>
			</View>
		)
  }

}