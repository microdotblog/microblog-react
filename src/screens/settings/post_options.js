import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TextInput, TouchableOpacity, Button, Keyboard, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import App from '../../stores/App'
import Services from '../../stores/Services'

@observer
export default class PostOptionsSettingsScreen extends React.Component{
  
  constructor(props){
    super(props)
    this.input_ref = React.createRef()
  }
  
  _handle_alternative_site_tap = () => {
    if(this.input_ref?.current != null && !Services.did_set_up_successfully){
      this.input_ref?.current.focus()
    }
    else if(Services.did_set_up_successfully){
      Services.set_custom_service()
    }
  }
  
  render() {
    const { user } = this.props
    return(
      <KeyboardAvoidingView behavior="position" style={{ flex: 1, padding: 15, backgroundColor: App.theme_background_color() }}>
        <View style={{ flexDirection: "column", marginTop: 12 }}>
          <Text style={{ marginBottom: 20, color: App.theme_text_color() }}>When writing a new blog post for @{user.username}, post to:</Text>
          <TouchableOpacity onPress={Services.set_microblog_service} style={{flexDirection: "row", alignItems: "center", marginBottom: 12}}>
            <View
              style={{
                width: 8,
                height: 8,
                backgroundColor: user.posting?.selected_service?.is_microblog ? App.theme_accent_color() : App.theme_input_contrast_background_color(),
                borderRadius: 50,
                marginRight: 8
            }} />
            <Text style={{ color: App.theme_text_color(), fontSize: 16, fontWeight: user.posting?.selected_service?.is_microblog ? "500" : "300" }}>Micro.blog hosted blog</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: "column" }}>
            <TouchableOpacity onPress={this._handle_alternative_site_tap} style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  backgroundColor: !user.posting?.selected_service?.is_microblog ? App.theme_accent_color() : App.theme_input_contrast_background_color(),
                  borderRadius: 50,
                  marginRight: 8
              }} />
              <Text style={{ color: App.theme_text_color(), fontSize: 16, fontWeight: !user.posting?.selected_service?.is_microblog ? "500" : "300" }}>WordPress or compatible blog</Text>
            </TouchableOpacity>
            <Text style={{ color: App.theme_text_color(), marginTop: 20 }}>Enter a URL to set up an external blog. We'll continue to post to a Micro.blog hosted blog until setup is complete:</Text>
            <View style={{ flexDirection: "column", marginTop: 12 }}>
              <TextInput
                ref={this.input_ref}
                style={{
                  backgroundColor: App.theme_input_contrast_alt_background_color(),
                  padding: 12,
                  borderRadius: 8,
                  color: App.theme_text_color(),
                  fontSize: 16,
                  fontWeight: "300",
                  marginBottom: 12
                }}
                placeholder="Enter your blog URL"
                placeholderTextColor={App.theme_placeholder_text_color()}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="go"
                onChangeText={(text) => Services.set_url(text)}
                onSubmitEditing={() => {Services.setup_new_service(); Keyboard.dismiss()}}
                value={Services.current_url}
                editable={!Services.did_set_up_successfully}
              />
              {
                Services.show_credentials ?
                <View style={{ padding: 12, borderRadius: 8, backgroundColor: App.theme_settings_group_background_color(), marginBottom: 12 }}>
                  <Text style={{fontWeight: "500", marginBottom: 12, color: App.theme_text_color()}}>Username:</Text>
                  <TextInput
                    style={{
                      backgroundColor: App.theme_input_contrast_alt_background_color(),
                      padding: 12,
                      borderRadius: 8,
                      color: App.theme_text_color(),
                      fontSize: 16,
                      fontWeight: "300",
                      marginBottom: 12
                    }}
                    placeholder="Username"
                    placeholderTextColor={App.theme_placeholder_text_color()}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={(text) => Services.set_username(text)}
                    value={Services.temp_username}
                    editable={!Services.checking_credentials}
                  />
                  <Text style={{fontWeight: "500", marginBottom: 12, color: App.theme_text_color()}}>Password:</Text>
                  <TextInput
                    style={{
                      backgroundColor: App.theme_input_contrast_alt_background_color(),
                      padding: 12,
                      borderRadius: 8,
                      color: App.theme_text_color(),
                      fontSize: 16,
                      fontWeight: "300"
                    }}
                    placeholder="Password"
                    placeholderTextColor={App.theme_placeholder_text_color()}
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={true}
                    onChangeText={(text) => Services.set_password(text)}
                    value={Services.temp_password}
                    editable={!Services.checking_credentials}
                  />
                </View>
                : null
              }
              <View style={{flexDirection: "row", justifyContent: Services.show_credentials ? "space-between" : "center"}}>
                {
                  Services.show_credentials ?
                  <>
                    <Button
                      title="Cancel"
                      color={App.theme_error_text_color()}
                      onPress={Services.clear}
                    />
                    <View style={{ flexDirection: "row", justifyContent: "center" }}>
                      <Button
                        title={"Sign In"}
                        color={App.theme_accent_color()}
                        onPress={Services.check_credentials_and_proceed_setup}
                        disabled={!Services.can_set_up_credentials() || !Services.has_credentials() || Services.checking_credentials}
                      />
                      {
                        Services.checking_credentials &&
                        <ActivityIndicator style={{ marginLeft: 8 }} color={App.theme_accent_color()} />
                      }
                    </View>
                  </>
                  :
                  <>
                  <Button
                    title={Services.should_show_set_up() ? "Set Up..." : "Remove Blog..."}
                    color={Services.should_show_set_up() ? App.theme_accent_color() : App.theme_error_text_color()}
                    onPress={Services.should_show_set_up() ? Services.setup_new_service : Services.trigger_custom_service_delete}
                    disabled={!Services.can_set_up() || Services.is_setting_up}
                  />
                  {
                    Services.is_setting_up &&
                    <ActivityIndicator style={{marginLeft: 8}} color={App.theme_accent_color()} />
                  }
                  </>
                }
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    )
  }
  
}