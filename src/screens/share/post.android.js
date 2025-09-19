import * as React from 'react'
import { observer } from 'mobx-react'
import { View, Text } from 'react-native'
import { TextInput } from 'react-native';
import { KeyboardAvoidingView, KeyboardStickyView } from "react-native-keyboard-controller";
import Share from '../../stores/Share'
import App from '../../stores/App'
import Auth from '../../stores/Auth';
import AssetToolbar from '../../components/keyboard/asset_toolbar'
import PostToolbar from '../../components/keyboard/post_toolbar'

@observer
export default class SharePostScreen extends React.Component {

	render() {
		const { selected_user } = Auth
		return (
			Share.is_logged_in() && selected_user?.posting != null ?
			<>
			  <KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={125} style={{ flex: 1 }}>
					{
						Share.error_message != null &&
						<View style={{ backgroundColor: App.theme_error_background_color(), padding: 10 }}>
							<Text style={{ color: App.theme_error_text_color(), fontWeight: "600" }}>{Share.error_message}</Text>
						</View>
					}
					{
						Share.can_save_as_bookmark() &&
							<View style={{ backgroundColor: App.theme_section_background_color(), padding: 10 }}>
								<Text style={{ color: App.theme_text_color(), fontWeight: "500" }}>
									You can save this URL as a bookmark or keep editing to create a new post.
								</Text>
							</View>
					}
					<TextInput
						placeholderTextColor="lightgrey"
						style={{
							fontSize: 18,
							marginTop: 0,
							padding: 8,
							color: App.theme_text_color()
						}}
						editable={!selected_user?.posting.is_sending_post}
						multiline={true}
						scrollEnabled={true}
						returnKeyType={'default'}
						keyboardType={'default'}
						autoFocus={true}
						autoCorrect={true}
						clearButtonMode={'while-editing'}
						enablesReturnKeyAutomatically={true}
						underlineColorAndroid={'transparent'}
						value={Share.share_text}
						selection={Share.text_selection}
						onChangeText={(text) => !selected_user?.posting.is_sending_post ? Share.set_post_text(text) : null}
						onSelectionChange={({ nativeEvent: { selection } }) => {
							Share.set_text_selection(selection)
						}}
					/>
				</KeyboardAvoidingView>
				<KeyboardStickyView>
					<AssetToolbar posting={selected_user?.posting} />
					<PostToolbar posting={selected_user?.posting} />
				</KeyboardStickyView>
			</>
			: null
		)
	}
}
