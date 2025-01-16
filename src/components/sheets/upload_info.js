import * as React from 'react';
import { useRef } from 'react';
import { observer } from 'mobx-react';
import { TouchableOpacity, View, Text, TextInput, ActivityIndicator } from 'react-native';
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import App from '../../stores/App'
import MicroPubApi, { POST_ERROR } from '../../api/MicroPubApi';
import Clipboard from '@react-native-clipboard/clipboard'
import Toast from 'react-native-simple-toast';

@observer
export default class UploadInfoSheet extends React.Component {  
	constructor(props) {
		super(props);
		this.upload = this.props.payload.upload;
		this.state = {
			alt_text: this.upload.alt,
			is_ai: this.upload.is_ai,
			is_editing: false,
			is_saving: false
		};
	}

	current_service() {
		const service = Auth.selected_user.posting.selected_service;
		return service.service_object();
	}
	
	current_destination_uid() {
		const service = Auth.selected_user.posting.selected_service;
		return service.config.posts_destination().uid;
	}

	save_alt_text() {
		const s = this.state.alt_text;
		MicroPubApi.set_alt_for_upload(this.current_service(), this.current_destination_uid(), this.upload.url, this.state.alt_text).then(data => {
			this.setState({ is_saving: false, is_ai: false });
			Auth.selected_user.posting?.selected_service?.update_uploads_for_active_destination();
		});
	}

	render() {
		return (
			<ActionSheet
				ref={this.actionSheetRef}
				id={this.props.sheetId}
				snapPoints={[50]}
				initialSnapIndex={[1]}
				overdrawEnabled={true}
				useBottomSafeAreaPadding={true}
				gestureEnabled={true}
				containerStyle={{
				  	backgroundColor: App.theme_background_color_secondary()
				}}
			>
				<View
					style={{
						padding: 15,
						justifyContent: 'center',
						borderRadius: 16,
						paddingBottom: 10,
						marginBottom: 30
					}}
				>
					<TouchableOpacity onPress={() => {
						console.log("press");
						App.open_url(this.upload.url);
					}}>
						<Text style={{ fontSize: 16, color: App.theme_text_color(), paddingBottom: 20 }}>{this.upload.url}</Text>
					</TouchableOpacity>
									
					<View>
						{ this.state.is_editing ? 
							<TextInput
								style={{
									height: 100,
									borderWidth: 1,
									borderColor: '#f80',
									backgroundColor: App.theme_input_contrast_background_color(),
									padding: 5,
									marginBottom: 25,
									borderRadius: 5,
									color: App.theme_text_color()
								}}
								blurOnSubmit={true}
								autoFocus={true}
								autoCorrect={true}
								autoCapitalize={"sentences"}
								multiline={true}
								returnKeyType={"done"}
								enablesReturnKeyAutomatically={true}
								value={this.state.alt_text}
								onChangeText={(text) => {
									this.setState({ alt_text: text });
								}}
								onSubmitEditing={() => {
									this.setState({ is_editing: false, is_saving: true });
									this.save_alt_text();
								}}
							/>
							:
							<Text style={{ fontSize: 16, color: App.theme_text_color(), paddingBottom: 25 }}>
								{ this.state.is_ai? '🤖' : null }
								{this.state.alt_text}
							</Text>
						}
						<View style={{ flexDirection: "row" }}>
							<View style={{ alignSelf: "flex-start", marginRight: 10 }}>
								<TouchableOpacity
									style={{
										padding: 8,
										paddingHorizontal: 15,
										backgroundColor: App.theme_button_background_color(),
										borderRadius: 20,
										borderColor: App.theme_section_background_color(),
										borderWidth: 1
									}}
									onPress={() => {
										const s = this.state.alt_text.replace('"', '');
										Clipboard.setString(s);
										SheetManager.hide(this.props.sheetId);
										setTimeout(function() {
											Toast.showWithGravity("Text copied", Toast.SHORT, Toast.CENTER);
										}, 200);
									}}
								>
									<Text style={{ color: App.theme_button_text_color() }}>Copy Text</Text>
								</TouchableOpacity>
							</View>
							<View style={{ alignSelf: "flex-start" }}>
								<TouchableOpacity
									style={{
										padding: 8,
										paddingHorizontal: 15,
										backgroundColor: App.theme_button_background_color(),
										borderRadius: 20,
										borderColor: App.theme_section_background_color(),
										borderWidth: 1
									}}
									onPress={() => {
										this.setState({ is_editing: true });
									}}
								>
									<Text style={{ color: App.theme_button_text_color() }}>Edit Text</Text>
								</TouchableOpacity>
							</View>
							{ this.state.is_saving ?
								<ActivityIndicator style={{ marginLeft: 10 }} />
								:
								null
							}
						</View>
					</View>
				</View>
			</ActionSheet>
		)
	}
}
