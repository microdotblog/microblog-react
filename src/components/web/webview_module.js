import * as React from 'react';
import { observer } from 'mobx-react';
import Auth from '../../stores/Auth';
import WebView from 'react-native-webview'

@observer
export default class WebViewModule extends React.Component{
  
  render() {
    console.log("WebViewModule:props", this.props)
    return (
      <WebView
        source={{ uri: `https://micro.blog/${this.props.endpoint}`, headers: {
          'Authorization' : `Bearer ${Auth.selected_user.token()}`
        }}}
        containerStyle={{ flex: 1, width: '100%', height: '100%' }}
        startInLoadingState={true}
      />
    )
  }
  
}