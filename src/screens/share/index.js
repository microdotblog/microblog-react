import { observer } from 'mobx-react'
import * as React from 'react'
import { ActivityIndicator, Button, Text, View, Platform } from 'react-native'
import App from '../../stores/App'
import Share from '../../stores/Share'
import SharePostScreen from './post'
import ShareImageOptionsScreen from './image_options'
import ShareHeaderComponent from '../../components/share/header'

@observer
export default class ShareScreen extends React.Component {

	componentDidMount() {
		console.log('ShareScreen:componentDidMount')
		Platform.OS === "ios" && Share.hydrate()
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
							{
								Platform.OS === "ios" ?
								<Text style={{ color: App.theme_text_color(), fontSize: 17, textAlign: "center", marginBottom: 10}}>{Share.temp_direct_shared_data}</Text>
								: null
							}
						</View>
						:
						Share.is_logged_in() ?
							<View style={{ position: "relative", flex: 1 }}>
								<ShareHeaderComponent />
								{
									Share.image_options_open ?
									<ShareImageOptionsScreen asset={Platform.OS === "ios" ? Share.selected_user?.posting?.post_assets[0] : null} />
									:
									<>
									<SharePostScreen />
									{
										Share.selected_user?.posting.is_sending_post || Share.selected_user?.posting.is_adding_bookmark ?
											<View 
												style={{ 
													position: 'absolute',
													top: 0,
													height: '100%',
													width: '100%',
													zIndex: 10,
													backgroundColor: App.theme_background_color(),
													opacity: 0.8
												}} 
											>
												<View style={{
													height: 400,
													justifyContent: 'center',
													alignItems: 'center'              
												}}>
													<ActivityIndicator color={App.theme_accent_color()} size={'large'} />
													<Text style={{ marginTop: 12, color: App.theme_text_color() }}>{ Share.selected_user?.posting.is_sending_post ? "Sending post..." : "Saving bookmark..." }</Text>
												</View>
											</View>
										: null
									}
									</>
								}
							</View>
							:
							<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
								<Text style={{ color: App.theme_text_color(), fontSize: 17, textAlign: "center", marginBottom: 10}}>Using the Micro.blog app, please sign in before using the share extension.</Text>
								<Button title="Open App" onPress={Share.open_in_app} />
							</View>
				}
			</View>
		)
	}

}
