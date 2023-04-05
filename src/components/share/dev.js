import * as React from 'react'
import { observer } from 'mobx-react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
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
				{
					Share.is_logged_in() ?
					<View>
					{
						Share.selected_user != null &&
						<Text style={{color: App.theme_text_color()}}>Selected User: {Share.selected_user?.username}</Text>
					}
					{
						Share.users.map((user, index) => {
							return (
								<View key={index}>
									<TouchableOpacity onPress={() => Share.select_user(user)}>
										<Image source={{ uri: user.avatar }} style={{ width: 50, height: 50, borderRadius: 50 }} />
										<Text style={{color: App.theme_text_color()}}>{user.username}</Text>
									</TouchableOpacity>
								</View>
								)
							})
						}
						</View>
						: null
					}
				</View>
			)
		}
}