import * as React from 'react';
import { observer } from 'mobx-react';
import { View } from 'react-native';
import Auth from './../../stores/Auth';
import WebViewModule from '../../components/web/webview_module'
import LoginMessage from '../../components/info/login_message'
import ImageModalModule from '../../components/images/image_modal'
import App from '../../stores/App'

@observer
export default class RepliesScreen extends React.Component{
  
  render() {
    return(
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {
          Auth.is_logged_in() && !Auth.is_selecting_user && !App.should_reload_web_view() ?
            <LoginMessage title="Replies" />
          :
          <LoginMessage title="Replies" />
        }
        <ImageModalModule />
      </View>
    )
  }
  
}