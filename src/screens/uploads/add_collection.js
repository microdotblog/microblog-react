import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TextInput, Button, ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import App from '../../stores/App';

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
	
	_dismiss = () => {
		Keyboard.dismiss();
		App.go_back();
	}

	_add_collection = async () => {
		this.setState({ is_networking: true });
		// ...
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
						returnKeyType={'go'}
						keyboardType={'url'}
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