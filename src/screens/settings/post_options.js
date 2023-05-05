import * as React from 'react';
import { observer } from 'mobx-react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Button, Keyboard } from 'react-native';
import App from '../../stores/App'
import Services from '../../stores/Services'

@observer
export default class PostOptionsSettingsScreen extends React.Component{
  
  constructor(props){
    super(props)
    this.input_ref = React.createRef()
  }
  
  _handle_alternative_site_tap = () => {
    // TODO: Let's highlight the input for now until we have more data
    if(this.input_ref?.current != null){
      this.input_ref?.current.focus()
    }
  }
  
  render() {
    const { user } = this.props
    return(
      <ScrollView style={{ flex: 1, padding: 15, backgroundColor: App.theme_background_color() }}>
        <View style={{ flexDirection: "column", marginTop: 12 }}>
          <Text style={{ marginBottom: 20, color: App.theme_text_color() }}>When writing a new blog post for @{user.username}, post to:</Text>
          <TouchableOpacity style={{flexDirection: "row", alignItems: "center", marginBottom: 12}}>
            <View
              style={{
                width: 8,
                height: 8,
                backgroundColor: user.posting?.selected_service?.is_microblog ? App.theme_accent_color() : App.theme_text_color(),
                borderRadius: 50,
                marginRight: 8
            }} />
            <Text style={{ color: App.theme_text_color(), fontSize: 16, fontWeight: user.posting?.selected_service?.is_microblog ? "500" : "300" }}>Micro.blog hosted weblog</Text>
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
              <Text style={{ color: App.theme_text_color(), fontSize: 16, fontWeight: user.posting?.selected_service?.is_microblog ? "500" : "300" }}>WordPress or compatible weblog</Text>
            </TouchableOpacity>
            <Text style={{ color: App.theme_text_color(), marginTop: 20 }}>Enter a URL to set up another blog. We'll continue to post to a Micro.blog hosted weblog until setup is complete:</Text>
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
              />
              <Button
                title={Services.should_show_set_up() ? "Set up..." : "Remove custom blog..."}
                color={Services.should_show_set_up() ? App.theme_accent_color() : App.theme_error_text_color()}
                onPress={Services.setup_new_service}
                disabled={!Services.can_set_up() || Services.is_setting_up}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    )
  }
  
}