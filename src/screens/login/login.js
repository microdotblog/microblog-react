import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TextInput, Button, ActivityIndicator, Platform, Keyboard, TouchableOpacity, Alert } from 'react-native';
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { appleAuth, AppleButton } from '@invertase/react-native-apple-authentication';
import Login from './../../stores/Login';
import App from '../../stores/App'

@observer
export default class LoginScreen extends React.Component{
  apple_credential_revoked_unsubscribe = null

  componentDidMount() {
    if(Platform.OS === "ios" && appleAuth.isSupported){
      this.apple_credential_revoked_unsubscribe = appleAuth.onCredentialRevoked(async () => {
        console.warn("Apple credentials revoked")
      })
    }
  }

  componentWillUnmount() {
    if(this.apple_credential_revoked_unsubscribe != null){
      this.apple_credential_revoked_unsubscribe()
      this.apple_credential_revoked_unsubscribe = null
    }
  }

  on_apple_button_press = async () => {
    try{
      const apple_auth_request_response = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL]
      })

      const credential_state = await appleAuth.getCredentialStateForUser(apple_auth_request_response.user)
      if(credential_state === appleAuth.State.AUTHORIZED){
        const full_name = [
          apple_auth_request_response.fullName?.givenName,
          apple_auth_request_response.fullName?.familyName
        ].filter(name => name != null && name.length > 0).join(" ")

        await Login.login_with_apple_credentials({
          user_id: apple_auth_request_response.user,
          identity_token: apple_auth_request_response.identityToken,
          email: apple_auth_request_response.email,
          full_name
        })
      }
    }
    catch(error){
      if(error?.code !== appleAuth.Error.CANCELED){
        Alert.alert("Ooops", "An error occured whilst trying to sign you in with Apple. Please try again.")
      }
    }
  }
  
  render() {
    return(
      <KeyboardAvoidingView behavior={ Platform.OS === "ios" ? "padding" : "height" } style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 15, backgroundColor: App.theme_background_color() }}>
        <View style={{ width: "100%" }}>
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
              backgroundColor: App.theme_input_contrast_background_color(), 
              fontSize: 17,
              borderColor: !Login.show_error ? App.theme_accent_color() : "#ea053b",
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
            color={App.theme_accent_color()}
            onPress={() => {Login.trigger_login(); Keyboard.dismiss()}}
            disabled={!Login.can_submit()}
          />
          {
            Platform.OS === "ios" && appleAuth.isSupported &&
            <View style={{
              marginTop: 22,
              marginBottom: 12,
              alignItems: "center"
            }}>
              <Text style={{
                fontWeight: "500",
                color: App.theme_text_color(),
                marginBottom: 10
              }}>Or sign in with Apple:</Text>
              <AppleButton
                buttonStyle={App.is_dark_mode() ? AppleButton.Style.WHITE : AppleButton.Style.BLACK}
                buttonType={AppleButton.Type.SIGN_IN}
                style={{ width: 220, height: 44 }}
                onPress={() => { if(!Login.is_loading){ this.on_apple_button_press() } }}
              />
            </View>
          }
          {
            Login.is_loading &&
            <ActivityIndicator 
              animating={Login.is_loading}
              style={{
                marginTop: 15,
                marginBottom: 15
              }}
            />
          }
          
          <View style={{
            marginBottom: 5,
            marginTop: Login.is_loading ? 0 : 8,
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Text style={{
              fontWeight: "300",
              color: App.theme_text_color(),
              textAlign: "center"
            }}>By using the app you accept our </Text>
            <TouchableOpacity onPress={() => App.open_url(App.terms_url)}>
              <Text style={{
                fontWeight: "600",
                color: App.theme_text_color(),
                textDecorationLine: "underline"
              }}>terms of service</Text>
            </TouchableOpacity>
            <Text style={{
              fontWeight: "300",
              color: App.theme_text_color(),
              textAlign: "center"
            }}>, </Text>
            <TouchableOpacity onPress={() => App.open_url(App.privacy_url)}>
              <Text style={{
                fontWeight: "600",
                color: App.theme_text_color(),
                textDecorationLine: "underline"
              }}>privacy policy</Text>
            </TouchableOpacity>
            <Text style={{
              fontWeight: "300",
              color: App.theme_text_color(),
              textAlign: "center"
            }}>, and </Text>
            <TouchableOpacity onPress={() => App.open_url(App.guidelines_url)}>
              <Text style={{
                fontWeight: "600",
                color: App.theme_text_color(),
                textDecorationLine: "underline"
              }}>community guidelines</Text>
            </TouchableOpacity>
            <Text style={{
              fontWeight: "300",
              color: App.theme_text_color(),
              textAlign: "center"
            }}>.</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    )
  }
  
}
