import * as React from 'react'
import { observer } from 'mobx-react'
import { TextInput, KeyboardAvoidingView, InputAccessoryView } from 'react-native'
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
				<KeyboardAvoidingView behavior={'padding'}>
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
						inputAccessoryViewID={this.input_accessory_view_id}
					/>
					<InputAccessoryView nativeID={this.input_accessory_view_id}>
						<AssetToolbar />
						<PostToolbar />
					</InputAccessoryView>
				</KeyboardAvoidingView>
				: null
		)
	}
}
