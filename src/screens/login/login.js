import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TextInput, Button, ActivityIndicator, Platform, KeyboardAvoidingView, Keyboard } from 'react-native';
import Login from './../../stores/Login';
import App from '../../stores/App'
import { Navigation } from 'react-native-navigation';
import ArrowBackIcon from './../../assets/icons/arrow_back.png';

@observer
export default class LoginScreen extends React.Component{
  
  constructor (props) {
    super(props)
    Navigation.events().bindComponent(this)
  }
  
  navigationButtonPressed = async ({ buttonId }) => {
    console.log("navigationButtonPressed::", buttonId)
    if(buttonId === "back_button"){
      Navigation.dismissModal(this.props.componentId)
    }
  }
  
  render() {
    return(
      <KeyboardAvoidingView behavior={ Platform.OS === "ios" ? "padding" : "height" } style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 15, backgroundColor: App.theme_background_color() }}>
        <Text style={{fontWeight: "700", color: App.theme_text_color()}}>Enter your email address to sign in to Micro.blog:</Text>
        <TextInput
          placeholderTextColor="lightgrey"
          textContentType={'emailAddress'}
          placeholder={"Enter your email address"}
          returnKeyType={'go'}
          keyboardType={'email-address'}
          blurOnSubmit={true}
          autoFocus={false}
          autoCorrect={true}
          autoCapitalize="none"
          autoComplete={"email"}
          clearButtonMode={'while-editing'}
          enablesReturnKeyAutomatically={true}
          underlineColorAndroid={'transparent'}
          style={{ 
            backgroundColor: App.theme_input_background_color(), 
            fontSize: 17,
            borderColor: `${!Login.show_error ? "#f80" : "#ea053b"}`, 
            borderWidth: 1,
            height: 50,
            width: "100%",
            borderRadius: 5,
            marginVertical: 15,
            paddingHorizontal: 15,
            color: App.theme_text_color()
          }}
          onChangeText={(text) => Login.set_input_value(text)}
          onSubmitEditing={() => {Login.trigger_login(); Keyboard.dismiss()}}
          value={Login.input_value}
        />
        <Button
          title="Continue"
          color="#f80"
          onPress={() => {Login.trigger_login(); Keyboard.dismiss()}}
          disabled={!Login.can_submit()}
        />
        <ActivityIndicator 
          animating={Login.is_loading}
          style={{
            marginTop: 15
          }}
        />
        {
          Login.message !== null && Login.message !== "" ?
          <View 
            style={{
              backgroundColor: '#6EE7B7',
              padding: 8,
              paddingHorizontal: 12,
              borderRadius: 5,
              elevation: 2
            }}>
            <Text style={{color: "#064E3B", fontWeight: "600"}}>{Login.message}</Text>
          </View>
          : null
        }
      </KeyboardAvoidingView>
    )
  }
  
}