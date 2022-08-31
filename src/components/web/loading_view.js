import * as React from 'react';
import { observer } from 'mobx-react';
import { ActivityIndicator, View, Text } from "react-native"
import App from '../../stores/App'

@observer
export default class WebLoadingViewModule extends React.Component{

  render() {
    return (
			<View style={{ flex: 1, height: '100%', position: 'absolute', width: '100%', backgroundColor: App.theme_background_color(), justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator animating={true} color={"#f80"} />
        <Text style={{ color: App.theme_text_color(), marginTop: 15 }}>{this.props.loading_text ?? "Loading posts..."}</Text>
			</View>
    )
  }

}
