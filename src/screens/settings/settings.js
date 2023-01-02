import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
import { Navigation } from 'react-native-navigation';
import App from '../../stores/App'
import { getVersion, getBuildNumber } from 'react-native-device-info';

@observer
export default class SettingsScreen extends React.Component{

	constructor (props) {
		super(props)
		Navigation.events().bindComponent(this)
	}
	
	navigationButtonPressed = async ({ buttonId }) => {
    if(buttonId === "back_button"){
      this._dismiss()
    }
	}
	
	_dismiss = () => {
		Navigation.dismissModal(this.props.componentId)
	}

  render() {
    return(
			<ScrollView style={{ flex: 1, padding: 15, backgroundColor: App.theme_background_color() }}>
				<View style={{ width: '100%' }}>
					<Text style={{ fontWeight: "500", marginBottom: 15, color: App.theme_text_color() }}>Coming soon...</Text>
				</View>
      </ScrollView>
    )
  }
  
}