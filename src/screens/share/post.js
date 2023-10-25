import * as React from 'react'
import { observer } from 'mobx-react'
import { InputAccessoryView, View, Text, Platform , TextInput } from 'react-native'
import Share from '../../stores/Share'
import App from '../../stores/App'
import AssetToolbar from '../../components/keyboard/asset_toolbar'
import PostToolbar from '../../components/keyboard/post_toolbar'
import HighlightingText from '../../components/text/highlighting_text';

@observer
export default class SharePostScreen extends React.Component {

	constructor (props) {
		super(props)
		this.input_accessory_view_id = "input_toolbar"
	}

	render() {
		return (
			Share.is_logged_in() && Share.selected_user?.posting != null ?
				<View style={{ flex: 1, backgroundColor: App.theme_background_color() }}>
					{
						Share.error_message != null &&
						<View style={{ backgroundColor: App.theme_error_background_color(), padding: 8 }}>
							<Text style={{ color: App.theme_error_text_color(), fontWeight: "600" }}>{Share.error_message}</Text>
						</View>
					}
					{
						Share.can_save_as_bookmark() &&
							<View style={{ backgroundColor: App.theme_section_background_color(), padding: 8 }}>
								<Text style={{ color: App.theme_text_color(), fontWeight: "500" }}>
									You can save this URL as a bookmark or keep editing to create a new post.
								</Text>
							</View>
					}
					{
						Platform.OS === 'ios' ?
							<>
								<HighlightingText
									placeholderTextColor="lightgrey"
									style={{
										height: 300,
										fontSize: 18,
										justifyContent: 'flex-start',
										alignItems: 'flex-start',
										marginTop: 4,
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
									value={Share.share_text}
									onChangeText={({ nativeEvent: { text } }) => !Share.selected_user?.posting.is_sending_post ? Share.set_post_text(text) : null}
									onSelectionChange={({ nativeEvent: { selection } }) => {
										Share.set_text_selection(selection)
									}}
									inputAccessoryViewID={this.input_accessory_view_id}
								/>
								<InputAccessoryView nativeID={this.input_accessory_view_id}>
									<AssetToolbar />
									<PostToolbar />
								</InputAccessoryView>
							</>
							: 
							<>
								<TextInput
									placeholderTextColor="lightgrey"
									style={{
										fontSize: 18,
										justifyContent: 'flex-start',
										alignItems: 'flex-start',
										marginTop: 4,
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
									value={Share.share_text}
									onChangeText={(text) => !Share.selected_user?.posting.is_sending_post ? Share.set_post_text(text) : null}
									onSelectionChange={({ nativeEvent: { selection } }) => {
										Share.set_text_selection(selection)
									}}
								/>
								<AssetToolbar />
								<PostToolbar />
							</>
					}
				</View>
				: null
		)
	}
}
