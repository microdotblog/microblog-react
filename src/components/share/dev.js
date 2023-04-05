import * as React from 'react'
import { observer } from 'mobx-react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import Share from '../../stores/Share'

@observer
export default class ShareDevComponent extends React.Component {
	
	render() {
		if(!__DEV__) return
		return (
			<View>
				<Text>Users: {Share.users.length}</Text>
				<Text>Is Logged In: {Share.is_logged_in() ? "Yes" : "No"}</Text>
				{
					Share.is_logged_in() ?
					<View>
					{
						Share.selected_user != null &&
						<Text>Selected User: {Share.selected_user?.username}</Text>
					}
					{
						Share.users.map((user, index) => {
							return (
								<View key={index}>
									<TouchableOpacity onPress={() => Share.select_user(user)}>
										<Image source={{ uri: user.avatar }} style={{ width: 50, height: 50, borderRadius: 50 }} />
										<Text>{user.username}</Text>
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