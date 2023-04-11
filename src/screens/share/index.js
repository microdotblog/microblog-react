import { observer } from 'mobx-react'
import * as React from 'react'
import { ActivityIndicator, Button, Text, View, KeyboardAvoidingView } from 'react-native'
import App from '../../stores/App'
import Share from '../../stores/Share'
import SharePostScreen from './post'
import ShareHeaderComponent from '../../components/share/header'

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
				backgroundColor: App.theme_background_color()
			}}>
				{
					Share.is_loading ?
						<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
							<ActivityIndicator color={App.theme_accent_color()} size="large" />
						</View>
						:
						Share.is_logged_in() ?
							<KeyboardAvoidingView behavior="height" style={{ position: "relative", flex: 1 }}>
								<ShareHeaderComponent />
								<SharePostScreen />
								{
									Share.selected_user?.posting.is_sending_post || Share.selected_user?.posting.is_adding_bookmark ?
										<View 
											style={{ 
												position: 'absolute',
												top: 0,
												bottom:0,
												width: '100%',
												flex: 1,
												justifyContent: 'center',
												alignItems: 'center',
												backgroundColor: App.theme_opacity_background_color(),
												zIndex: 10
											}} 
										>
											<ActivityIndicator color="#f80" size={'large'} />
											<Text style={{ marginTop: 12, color: App.theme_text_color() }}>{ Share.selected_user?.posting.is_sending_post ? "Sending post..." : "Saving bookmark..." }</Text>
										</View>
									: null
								}
							</KeyboardAvoidingView>
							:
							<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
								<Text style={{ color: App.theme_text_color(), fontSize: 17, textAlign: "center", marginBottom: 10}}>Please login, in the app, before using the Share Extension</Text>
								<Button title="Open App" onPress={Share.open_in_app} />
							</View>
				}
			</View>
		)
	}

}
