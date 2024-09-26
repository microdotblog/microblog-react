import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TextInput, Button, ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import App from '../../stores/App'

@observer
export default class AddBookmarkScreen extends React.Component{

	constructor (props) {
		super(props)
		this.state = {
			url: ""
		}
		this._input_ref = React.createRef()
  }
	
	_dismiss = () => {
    Keyboard.dismiss()
		App.go_back()
	}

	_add_bookmark = async () => {
		const bookmark = await Auth.selected_user.posting.add_bookmark(this.state.url)
		console.log("AddBookmarkScreen:_add_bookmark", bookmark)
		if (bookmark) {
			this.setState({ url: "" })
			this._input_ref.current.clear()
			this._dismiss()
		}
	}
  
	render() {
		const { posting } = Auth.selected_user
    return(
      <KeyboardAvoidingView behavior={ Platform.OS === "ios" ? "padding" : "height" } style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 15, backgroundColor: App.theme_background_color() }}>
        <View style={{ width: "100%" }}>
				  <Text style={{ fontWeight: "500", fontSize: 16, color: App.theme_text_color() }}>
					  For Micro.blog Premium subscribers, bookmarked web pages are also archived so you can read them later and make highlights.
				  </Text>
				  <TextInput
					  ref={this._input_ref}
            placeholderTextColor="lightgrey"
            textContentType={'URL'}
            placeholder={"URL"}
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
            onChangeText={(text) => !posting.is_adding_bookmark ? this.setState({url: text}) : null}
          />
          <Button
            title="Save Bookmark"
					  color="#f80"
					  onPress={this._add_bookmark}
            disabled={posting.is_adding_bookmark}
          />
          <ActivityIndicator 
            animating={posting.is_adding_bookmark}
            style={{
              marginTop: 15
            }}
          />
        </View>
      </KeyboardAvoidingView>
    )
  }
  
}