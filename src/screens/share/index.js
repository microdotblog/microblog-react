import * as React from 'react'
import { observer } from 'mobx-react'
import { View, TextInput, ActivityIndicator, Button, KeyboardAvoidingView, Text } from 'react-native'
import Share from '../../stores/Share'

@observer
export default class ShareScreen extends React.Component {

	componentDidMount() {
		console.log('ShareScreen:componentDidMount')
		Share.hydrate()
	}

	render() {
		return (
			<View style={{flex: 1, justifyContent: "center"}}>
				{
					Share.is_loading ?
						<ActivityIndicator color={Share.theme_accent_color()} size="large" />
						:
						<KeyboardAvoidingView behavior={'padding'} style={{ flex: 1 }}>
							<TextInput
								placeholderTextColor="lightgrey"
								style={{
									fontSize: 18,
									justifyContent: 'flex-start',
									alignItems: 'flex-start',
									padding: 8
								}}
								multiline={true}
								scrollEnabled={true}
								returnKeyType={'default'}
								keyboardType={'default'}
								autoFocus={true}
								autoCorrect={true}
								clearButtonMode={'while-editing'}
								enablesReturnKeyAutomatically={true}
								underlineColorAndroid={'transparent'}
							/>
							<Button title="Open in App" onPress={Share.open_in_app} />
							<Text>Users: {Share.users.length}</Text>
							<Text>Selected User: {Share.selected_user?.username}</Text>
							<Text>Is Logged In: {Share.is_logged_in() ? "Yes" : "No"}</Text>
						</KeyboardAvoidingView>
				}
			</View>
		)
	}

}
