import * as React from 'react';
import { observer } from 'mobx-react';
import { ScrollView, View, Text, Image, TouchableOpacity } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { Screens, POSTING_SCREEN } from '../../screens';
import CheckmarkIcon from '../../assets/icons/checkmark.png';

@observer
export default class ImageCropScreen extends React.Component{
	
	constructor (props) {
		super(props)
		this.state = {
			scroll_size: 0,
			is_cropped: true
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
		const { scroll_size, is_cropped } = this.state
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
				<View style={{ flex: 1, flexDirection: "row" }}>
					<TouchableOpacity
						key={ "toggle_square" }
						style={{ height: 34, paddingLeft: 14, paddingRight: 14, marginTop: 40, marginBottom: 20, marginLeft: 12, marginRight: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: (is_cropped ? App.theme_button_background_color() : App.theme_button_disabled_background_color()), borderRadius: 25 }}
						onPress={() => {
							this.setState({ is_cropped: !is_cropped })
						}}
					>
						<Text style={{ color: (is_cropped ? App.theme_button_text_color() : App.theme_button_disabled_text_color()) }}>
							Crop photo to square 
							{ is_cropped ? <Image source={CheckmarkIcon} style={{ width: 12, height: 12, marginLeft: 5, tintColor: App.theme_button_text_color() }} /> : null }
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		)
  }

}