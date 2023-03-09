import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, Image } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { Screens, POSTING_SCREEN } from '../../screens';

@observer
export default class ImageCropScreen extends React.Component{

	constructor (props) {
		super(props)
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
	  const { asset } = this.props
	  return (
		<View>
			<Image source={{ uri: asset.uri }} style={{ width: "100%", height: 300 }} />
		</View>
	  )
  }

}