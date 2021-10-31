import * as React from 'react';
import { observer } from 'mobx-react';
import Auth from '../../stores/Auth';
import WebView from 'react-native-webview'

@observer
export default class WebViewModule extends React.Component{

  constructor (props) {
    super(props)
    this.ref = React.createRef()
    this.state = {
      endpoint: this.props.endpoint,
      signin_endpoint: `hybrid/signin?token=${Auth.selected_user.token()}&redirect_to=${this.props.endpoint}`
    }
  }
  
  render() {
    return (
      <WebView
        ref={this.ref}
        source={{ uri: `https://micro.blog/${Auth.did_load_one_or_more_webviews ? this.props.endpoint : this.state.signin_endpoint}`}}
        containerStyle={{ flex: 1, width: '100%', height: '100%' }}
        startInLoadingState={true}
        onLoadEnd={Auth.set_did_load_one_or_more_webviews}
      />
    )
  }
  
}