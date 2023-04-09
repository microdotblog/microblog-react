import * as React from 'react'
import { observer } from 'mobx-react'
import { TextInput, Button, KeyboardAvoidingView, InputAccessoryView, ActivityIndicator, View } from 'react-native'
import Share from '../../stores/Share'
import App from '../../stores/App'
import AssetToolbar from '../../components/keyboard/asset_toolbar'
import PostToolbar from '../../components/keyboard/post_toolbar'

@observer
export default class SharePostScreen extends React.Component {

	constructor (props) {
		super(props)
		this.input_accessory_view_id = "input_toolbar"
	}

	render() {
		return (
			Share.is_logged_in() && Share.selected_user?.posting != null ?
				<KeyboardAvoidingView behavior={'padding'} >
					<TextInput
						placeholderTextColor="lightgrey"
						style={{
							fontSize: 18,
							justifyContent: 'flex-start',
							alignItems: 'flex-start',
							marginTop: 3,
							// ...Platform.select({
							// 	android: {
							// 	marginBottom: posting.post_text_length() > posting.max_post_length() || posting.post_title ? posting.post_assets.length > 0 ? 135 : 80 : posting.post_assets.length > 0 ? 93 : 38,
							// 	},
							// 	ios: {
							// 		paddingBottom: posting.post_text_length() > posting.max_post_length() ? 150 : 0,
							// 		flex: 1
							// 	}
							// }),
							padding: 8,
							color: App.theme_text_color()
						}}
						editable={!Share.selected_user?.posting.is_sending_post}
						multiline={true}
						scrollEnabled={true}
						returnKeyType={'default'}
						keyboardType={'default'}
						autoFocus={true}
						autoCorrect={true}
						clearButtonMode={'while-editing'}
						enablesReturnKeyAutomatically={true}
						underlineColorAndroid={'transparent'}
						value={Share.selected_user?.posting.post_text}
						onChangeText={(text) => !Share.selected_user?.posting.is_sending_post ? Share.selected_user?.posting.set_post_text_from_typing(text) : null}
						onSelectionChange={({ nativeEvent: { selection } }) => {
							Share.selected_user?.posting.set_text_selection(selection)
						}}
						inputAccessoryViewID={this.input_accessory_view_id}
					/>
					<InputAccessoryView nativeID={this.input_accessory_view_id}>
						<AssetToolbar />
						<PostToolbar />
					</InputAccessoryView>
					<Button title="Send post" onPress={Share.send_post} />
					{
						Share.can_save_as_bookmark() &&
						<Button title="Save as bookmark" onPress={Share.save_as_bookmark} />
					}
					{/* <Button title="Open in App" onPress={Share.open_in_app} /> */}
					{
						Share.selected_user?.posting.is_sending_post || Share.selected_user?.posting.is_adding_bookmark ?
						<View 
							style={{ 
								position: 'absolute',
								top: 0,
								bottom:0,
								width: '100%',
								justifyContent: 'center',
								alignItems: 'center',
								backgroundColor: App.theme_opacity_background_color(),
								zIndex: 10
							}} 
						>
							<ActivityIndicator color="#f80" size={'large'} />
						</View>
						: null
					}
				</KeyboardAvoidingView>
				: null
		)
	}
}
