import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TextInput, Button, ActivityIndicator, Platform, Keyboard, TouchableOpacity } from 'react-native';
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Login from './../../stores/Login';
import App from '../../stores/App'

@observer
export default class LoginScreen extends React.Component{
  
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
