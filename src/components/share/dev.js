import * as React from 'react'
import { observer } from 'mobx-react'
import { View, Text } from 'react-native'
import Share from '../../stores/Share'
import App from '../../stores/App'

@observer
export default class ShareDevComponent extends React.Component {
	
	render() {
		if(!__DEV__) return
		return (
			<View style={{padding: 15, borderRadius: 5, backgroundColor: App.theme_section_background_color()}}>
				<Text style={{color: App.theme_text_color()}}>Users: {Share.users.length}</Text>
				<Text style={{color: App.theme_text_color()}}>Is Logged In: {Share.is_logged_in() ? "Yes" : "No"}</Text>
			</View>
		)
	}
}