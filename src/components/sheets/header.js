import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text } from 'react-native';
import App from '../../stores/App'

@observer
export default class SheetHeader extends React.Component{
  
  render() {
    return(
      <View
        style={{
          padding: 15,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 16,
          paddingBottom: 5
        }}
      >
        <Text style={{ fontWeight: '800', marginBottom: 15, color: App.theme_text_color() }}>{this.props.title}</Text>
      </View>
    )
  }
  
}