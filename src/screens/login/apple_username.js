import * as React from 'react'
import { observer } from 'mobx-react'
import { View, Text, TextInput, Button, ActivityIndicator, Platform, Keyboard } from 'react-native'
import { KeyboardAvoidingView } from "react-native-keyboard-controller"
import Login from './../../stores/Login'
import App from '../../stores/App'

@observer
export default class AppleUsernameScreen extends React.Component{
  render() {
    return(
      <KeyboardAvoidingView behavior={ Platform.OS === "ios" ? "padding" : "height" } style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 15, backgroundColor: App.theme_background_color() }}>
        <View style={{ width: "100%" }}>
          <Text style={{fontWeight: "700", color: App.theme_text_color()}}>Pick a username to finish creating your Micro.blog account:</Text>
          <TextInput
            placeholderTextColor="lightgrey"
            textContentType={'username'}
            placeholder={"Username"}
            returnKeyType={'go'}
            blurOnSubmit={true}
            autoFocus={true}
            autoCorrect={false}
            autoCapitalize="none"
            autoComplete={"username"}
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
            onChangeText={(text) => Login.set_apple_username(text)}
            onSubmitEditing={() => {
              Login.register_apple_username()
              Keyboard.dismiss()
            }}
            value={Login.apple_username}
          />
          <Button
            title="Register"
            color={App.theme_accent_color()}
            onPress={() => {
              Login.register_apple_username()
              Keyboard.dismiss()
            }}
            disabled={!Login.can_submit_apple_username()}
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
          <Text style={{
            marginTop: Login.is_loading ? 0 : 15,
            color: App.theme_text_color(),
            fontWeight: "300",
            textAlign: "center"
          }}>Micro.blog will create a new hosted microblog for you to try. You can also use Micro.blog for free with an existing blog.</Text>
        </View>
      </KeyboardAvoidingView>
    )
  }
}
