import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity } from 'react-native';
import App from '../../stores/App'

@observer
export default class LoginMessage extends React.Component{
  
  render() {
    return(
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {
          this.props.title ?
            <Text style={{ color: App.theme_text_color() }}>{this.props.title}</Text>
          : null
        }
        <TouchableOpacity style={{ marginTop: 15 }} onPress={() => App.navigate_to_screen("Login")}>
          <Text style={{fontWeight: "700", color: App.theme_accent_color()}}>Please sign in to continue</Text>
        </TouchableOpacity>
      </View>
    )
  }
  
}