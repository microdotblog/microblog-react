import * as React from 'react'
import { observer } from 'mobx-react'
import { View, ActivityIndicator, Text, Button } from 'react-native'
import Share from '../../stores/Share'
import App from '../../stores/App'
import SharePostScreen from './post'

@observer
export default class ShareScreen extends React.Component {

	componentDidMount() {
		console.log('ShareScreen:componentDidMount')
		Share.hydrate()
	}

	render() {
		return (
			<View style={{
				flex: 1,
				backgroundColor: App.theme_background_color(),
				padding: 8
			}}>
				{
					Share.is_loading ?
						<ActivityIndicator color={Share.theme_accent_color()} size="large" />
						:
						Share.is_logged_in() ?
							<SharePostScreen />
							:
							<View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
								<Text style={{ color: App.theme_text_color(), fontSize: 17, textAlign: "center", marginBottom: 10}}>Please login, in the app, before using the Share Extension</Text>
								<Button title="Open App" onPress={Share.open_in_app} />
							</View>
				}
			</View>
		)
	}

}
