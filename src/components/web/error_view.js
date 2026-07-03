import * as React from 'react'
import { observer } from 'mobx-react'
import { View, Text, Pressable } from "react-native"
import App from '../../stores/App'

@observer
export default class WebErrorViewModule extends React.Component {

  render() {
    return (
      <Pressable
        onPress={this.props.on_retry}
        style={{ flex: 1, height: '100%', position: 'absolute', width: '100%', backgroundColor: App.theme_background_color(), justifyContent: 'center', alignItems: 'center' }}
        accessibilityRole="button"
        accessibilityLabel="Retry loading content"
      >
        <Text style={{ color: App.theme_text_color(), marginTop: 15, fontSize: 17 }}>Error loading content.</Text>
        <Text style={{ color: App.theme_text_color(), marginTop: 15, fontWeight: '700' }}>{this.props.error_name}</Text>
        <Text style={{ color: App.theme_text_color(), marginTop: 15 }}>Tap to try again...</Text>
      </Pressable>
    )
  }

}
