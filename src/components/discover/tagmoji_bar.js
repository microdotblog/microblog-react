import * as React from 'react';
import { observer } from 'mobx-react';
import Discover from '../../stores/Discover'
import { TouchableOpacity, View, Text } from 'react-native';

@observer
export default class TagmojiBar extends React.Component{
  
  render() {
    if (Discover.tagmoji.length > 0) {
      return (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 10,
            width: '100%',
          }}>
          <Text>Some recent posts from the community</Text>
          <TouchableOpacity
            style={{
              borderColor: 'lightgray',
              borderWidth: 1,
              padding: 4,
              borderRadius: 5,
            }}
          >
            <Text>{Discover.random_tagmoji}</Text>
          </TouchableOpacity>
        </View>
      )
    }
    return null
  }
  
}