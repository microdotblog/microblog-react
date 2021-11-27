import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text } from 'react-native';

@observer
export default class ProfileHeader extends React.Component{
  
  render() {
    return(
      <View style={{ padding: 8 }}>
        <Text>This is a profile view for {this.props.username}</Text>
      </View>
    )
  }
  
}