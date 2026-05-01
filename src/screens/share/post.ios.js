import * as React from 'react'
import { observer } from 'mobx-react'
import { View, Text } from 'react-native'
import { KeyboardStickyView } from "react-native-keyboard-controller"
import Share from '../../stores/Share'
import App from '../../stores/App'
import AssetToolbar from '../../components/keyboard/asset_toolbar'
import PostToolbar from '../../components/keyboard/post_toolbar'
import HighlightingText from '../../components/text/highlighting_text'

@observer
export default class SharePostScreen extends React.Component {

	constructor (props) {
		super(props)
		this.state = {
			toolbar_height: 0,
		}
	}

	render() {
		const { selected_user } = Share
		const posting = selected_user?.posting
		const selection_flat = `${Share.text_selection.start} ${Share.text_selection.end}`
		return (
			Share.is_logged_in() && posting != null ?
				<>
					<View style={{ flex: 1, backgroundColor: App.theme_background_color() }}>
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
						<View style={{ flex: 1 }}>
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
									color: App.theme_text_color()
								}}
								editable={!posting.is_sending_post}
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
								bottomOverlayHeight={this.state.toolbar_height}
								selection={selection_flat}
								onChangeText={({ nativeEvent: { text } }) => !posting.is_sending_post ? Share.set_post_text(text) : null}
								onSelectionChange={({ nativeEvent: { selection } }) => {
									Share.set_text_selection(selection)
								}}
							/>
						</View>
					</View>
					<KeyboardStickyView onLayout={({ nativeEvent }) => {
						const toolbar_height = nativeEvent.layout.height
						if (toolbar_height !== this.state.toolbar_height) {
							this.setState({ toolbar_height })
						}
					}}>
						<View style={{ position: 'relative' }}>
							{
								!posting.post_title &&
								<Text
									style={{
										fontWeight: '400',
										paddingVertical: 2,
										paddingHorizontal: 6,
										color: App.theme_text_color(),
										position: 'absolute',
										right: 3,
										top: -26,
										backgroundColor: App.theme_chars_background_color(),
										borderRadius: 6,
										overflow: 'hidden',
										zIndex: 5
									}}
								><Text style={{ color: posting.post_text_length() > posting.max_post_length() ? '#a94442' : App.theme_text_color() }}>{posting.post_text_length()}</Text>/{posting.max_post_length()}</Text>
							}
							<AssetToolbar posting={posting} />
							<PostToolbar posting={posting} hide_count />
						</View>
					</KeyboardStickyView>
				</>
				: null
		)
	}
}
