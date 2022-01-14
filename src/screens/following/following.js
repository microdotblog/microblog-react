import * as React from 'react';
import { observer } from 'mobx-react';
import { View } from 'react-native';
import Auth from './../../stores/Auth';
import WebViewModule from '../../components/web/webview_module'
import LoginMessage from '../../components/info/login_message'

@observer
export default class FollowingScreen extends React.Component{
  
  render() {
    return(
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				{
					Auth.is_logged_in() && !Auth.is_selecting_user ?
          <WebViewModule endpoint={`hybrid/following/${this.props.username}`} component_id={this.props.componentId} />
          :
          <LoginMessage title="Users following" />
        }
      </View>
    )
  }
  
}