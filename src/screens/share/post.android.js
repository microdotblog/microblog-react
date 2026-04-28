import * as React from 'react'
import { observer } from 'mobx-react'
import { View, Text } from 'react-native'
import { KeyboardAvoidingView, KeyboardStickyView } from "react-native-keyboard-controller";
import Share from '../../stores/Share'
import App from '../../stores/App'
import Auth from '../../stores/Auth';
import AssetToolbar from '../../components/keyboard/asset_toolbar'
import PostToolbar from '../../components/keyboard/post_toolbar'
import HighlightingText from '../../components/text/highlighting_text'

@observer
export default class SharePostScreen extends React.Component {

	render() {
		const { selected_user } = Auth
		const selection_flat = `${Share.text_selection.start} ${Share.text_selection.end}`
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
					<HighlightingText
						placeholderTextColor="lightgrey"
						style={{
							minHeight: 300,
							fontSize: 18,
							justifyContent: 'flex-start',
							alignItems: 'flex-start',
							marginTop: 0,
							flex: 1,
							padding: 8,
							textAlignVertical: 'top',
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
						selection={selection_flat}
						onChangeText={({ nativeEvent: { text } }) => !selected_user?.posting.is_sending_post ? Share.set_post_text(text) : null}
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
