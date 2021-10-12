import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity } from 'react-native';
import { loginScreen } from './../../screens'

@observer
export default class LoginMessage extends React.Component{
  
  render() {
    return(
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{this.props.title}</Text>
        <TouchableOpacity onPress={loginScreen}>
          <Text style={{fontWeight: "700", color: "orange"}}>Please sign in to continue</Text>
        </TouchableOpacity>
      </View>
    )
  }
  
}