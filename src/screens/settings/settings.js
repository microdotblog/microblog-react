import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, ScrollView, Switch } from 'react-native';
import { Navigation } from 'react-native-navigation';
import App from '../../stores/App'
import Settings from '../../stores/Settings';

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
				<View style={{ width: '100%', marginBottom: 25 }}>
					<Text style={{ fontWeight: "500", marginBottom: 15, color: App.theme_text_color() }}>Work in progress...</Text>
				</View>
				<View style={{width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15}}>
					<Text style={{ fontWeight: "600", fontSize: 17, color: App.theme_text_color() }}>Open links in external browser</Text>
					<Switch value={Settings.open_links_in_external_browser} onValueChange={Settings.toggle_open_links_in_external_browser} />
				</View>
				<View style={{width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15}}>
					<Text style={{ fontWeight: "600", fontSize: 17, color: App.theme_text_color() }}>Reader mode</Text>
					<Switch disabled={Settings.open_links_in_external_browser} value={Settings.open_links_in_external_browser ? false : Settings.open_links_with_reader_mode} onValueChange={Settings.toggle_open_links_with_reader_mode} />
				</View>
      </ScrollView>
    )
  }
  
}