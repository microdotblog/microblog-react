import * as React from 'react';
import { observer } from 'mobx-react';
import { View } from 'react-native';
import Auth from './../../stores/Auth';
import LoginMessage from './../../components/info/login_message';
import WebViewModule from '../../components/web/webview_module'

@observer
export default class MentionsScreen extends React.Component{
  
  render() {
    return(
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {
          Auth.is_logged_in() && !Auth.is_selecting_user ?
          <WebViewModule endpoint="hybrid/mentions" />
          :
          <LoginMessage title="Mentions" />
        }
      </View>
    )
  }
  
}