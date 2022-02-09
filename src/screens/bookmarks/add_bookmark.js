import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TextInput, Button, ActivityIndicator, Keyboard, KeyboardAvoidingView } from 'react-native';
import { Navigation } from 'react-native-navigation';

@observer
export default class AddBookmarkScreen extends React.Component{

	constructor (props) {
		super(props)
		Navigation.events().bindComponent(this)
  }

  navigationButtonPressed = async ({ buttonId }) => {
    console.log("navigationButtonPressed::", buttonId)
    if(buttonId === "back_button"){
      this._dismiss()
    }
	}
	
	_dismiss = () => {
    Keyboard.dismiss()
		Navigation.dismissModal(this.props.componentId)
	}
  
  render() {
    return(
      <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 15 }}>
				<Text style={{ fontWeight: "500", fontSize: 16 }}>
					For Micro.blog Premium subscribers, bookmarked web pages are also archived so you can read them later and make highlights.
				</Text>
        <TextInput
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
            backgroundColor: '#f2f2f2', 
            fontSize: 17,
            borderColor: '#f80', 
            borderWidth: 1,
            height: 50,
            width: "100%",
            borderRadius: 5,
            marginVertical: 15,
            paddingHorizontal: 15,
            color: 'black'
          }}
        />
        <Button
          title="Save Bookmark"
          color="#f80"          
        />
        <ActivityIndicator 
          animating={false}
          style={{
            marginTop: 15
          }}
        />
      </KeyboardAvoidingView>
    )
  }
  
}