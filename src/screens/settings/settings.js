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
				<Text style={{ fontWeight: "500", marginBottom: 10, marginTop: 15, marginLeft: 10, color: App.theme_text_color() }}>Browser</Text>
				<View style={{ padding: 12, backgroundColor: App.theme_settings_group_background_color(), borderRadius: 8}}>
					<View style={{ width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, paddingTop: 0, borderBottomWidth: 1, borderColor: App.theme_border_color()}}>
						<Text style={{ fontSize: 16, color: App.theme_text_color() }}>Open links in external browser</Text>
						<Switch value={Settings.open_links_in_external_browser} onValueChange={Settings.toggle_open_links_in_external_browser} trackColor={{true: App.theme_accent_color()}} />
					</View>
					<View style={{ width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, paddingBottom: 0, }}>
						<Text style={{ fontSize: 16, color: App.theme_text_color() }}>Reader View</Text>
						<Switch disabled={Settings.open_links_in_external_browser} value={Settings.open_links_in_external_browser ? false : Settings.open_links_with_reader_mode} onValueChange={Settings.toggle_open_links_with_reader_mode} trackColor={{true: App.theme_accent_color()}} />
					</View>
				</View>
      </ScrollView>
    )
  }
  
}