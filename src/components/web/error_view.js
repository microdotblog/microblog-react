import * as React from 'react';
import { observer } from 'mobx-react';
import { ActivityIndicator, View, Text } from "react-native"
import App from '../../stores/App'

@observer
export default class WebErrorViewModule extends React.Component{
  
  render() {
    return (
      <View style={{ flex: 1, height: '100%', position: 'absolute', width: '100%', backgroundColor: App.theme_background_color(), justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: App.theme_text_color(), marginTop: 15, fontSize: 17 }}>Whoops, an error occured.</Text>
        <Text style={{ color: App.theme_text_color(), marginTop: 15, fontWeight: '700' }}>{this.props.error_name}</Text>
        <Text style={{ color: App.theme_text_color(), marginTop: 15 }}>Please pull to refresh to try again...</Text>
      </View>
    )
  }

}
