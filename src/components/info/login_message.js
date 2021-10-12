import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text } from 'react-native';

@observer
export default class LoginMessage extends React.Component{
  
  render() {
    return(
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{this.props.title}</Text>
        <Text style={{fontWeight: "700", color: "orange"}}>Please log in to continue</Text>
      </View>
    )
  }
  
}