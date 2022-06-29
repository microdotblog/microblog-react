import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity } from 'react-native';
import { loginScreen } from './../../screens'
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
        <TouchableOpacity onPress={loginScreen}>
          <Text style={{fontWeight: "700", color: "orange"}}>Please sign in to continue</Text>
        </TouchableOpacity>
      </View>
    )
  }
  
}