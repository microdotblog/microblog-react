import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text } from 'react-native';

@observer
export default class DiscoverScreen extends React.Component{
  
  render() {
    return(
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Discover</Text>
      </View>
    )
  }
  
}