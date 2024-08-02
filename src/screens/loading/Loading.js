import * as React from 'react';
import { observer } from 'mobx-react';
import { Text, View } from 'react-native';
import App from '../../stores/App'

@observer
export default class LoadingScreen extends React.Component {

  componentDidMount() {
    //App.set_navigation(this.props.navigation)
  }

  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: App.theme_text_color() }}>Loading...</Text>
      </View>
    )
  }

}