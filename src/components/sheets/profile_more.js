import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text } from 'react-native';

@observer
export default class ProfileMoreMenu extends React.Component{
  
  render() {
    return(
      <View
        style={{
          padding: 15,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 16
        }}
      >
        <Text style={{ fontWeight: '800', marginBottom: 15 }}>More</Text>
        <Text>{ this.props.username }</Text>
      </View>
    )
  }
  
}