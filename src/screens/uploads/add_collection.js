import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TextInput, Button, ActivityIndicator, Keyboard, Platform } from 'react-native';
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Auth from '../../stores/Auth';
import App from '../../stores/App';
import MicroPubApi, { POST_ERROR } from '../../api/MicroPubApi';

@observer
export default class AddCollectionScreen extends React.Component{

	constructor (props) {
		super(props);
		this.state = {
			name: "",
			is_networking: false
		};
		this._input_ref = React.createRef();
	}
	
	current_service() {
		const service = Auth.selected_user.posting.selected_service;
		return service.service_object();
	}
	
	current_destination_uid() {
		const service = Auth.selected_user.posting.selected_service;
		return service.config.posts_destination().uid;
	}
	
	_dismiss = () => {
		Keyboard.dismiss();
		App.go_back();
	}

	_add_collection = async () => {
		if (this.state.name.length == 0) {
			return;
		}
		
		this.setState({ is_networking: true });

		MicroPubApi.create_collection(this.current_service(), this.current_destination_uid(), this.state.name).then(data => {
			this.setState({ is_networking: false });
			Keyboard.dismiss();
			App.go_back();
		});
	}
  
	render() {
		const { posting } = Auth.selected_user
		return (
			<KeyboardAvoidingView behavior={ Platform.OS === "ios" ? "padding" : "height" } style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 15, backgroundColor: App.theme_background_color() }}>
				<View style={{ width: "100%" }}>
					<Text style={{ fontWeight: "500", fontSize: 16, color: App.theme_text_color() }}>
						Add a new collection to organize photos on your blog.
					</Text>
					<TextInput
						ref={this._input_ref}
						placeholderTextColor="lightgrey"
						textContentType={'URL'}
						placeholder={"Name"}
						returnKeyType={'done'}
						keyboardType={'default'}
						blurOnSubmit={true}
						autoFocus={true}
						autoCorrect={false}
						autoCapitalize="none"
						autoComplete={'off'}
						clearButtonMode={'while-editing'}
						enablesReturnKeyAutomatically={true}
						underlineColorAndroid={'transparent'}
						style={{ 
							backgroundColor: App.theme_input_contrast_background_color(), 
							fontSize: 17,
							borderColor: '#f80', 
							borderWidth: 1,
							height: 50,
							width: "100%",
							borderRadius: 5,
							marginVertical: 15,
							paddingHorizontal: 15,
							color: App.theme_text_color()
						}}
						onChangeText={(text) => this.setState({name: text})}
					/>
					<Button
						title="Save Collection"
						color="#f80"
						onPress={this._add_collection}
						disabled={this.state.is_networking}
					/>
					<ActivityIndicator 
						animating={this.state.is_networking}
						style={{
							marginTop: 15
						}}
					/>
				</View>
			</KeyboardAvoidingView>
		)
	}
  
}
