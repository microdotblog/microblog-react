import * as React from 'react';
import { observer } from 'mobx-react';
import { View } from 'react-native';
import Auth from './../../stores/Auth';
import WebViewModule from '../../components/web/webview_module'
import LoginMessage from '../../components/info/login_message'
import ImageModalModule from '../../components/images/image_modal'
import ProfileHeader from '../../components/profile/profile_header'
import MutedMessage from '../../components/info/muted_message'
import App from '../../stores/App'

@observer
export default class ProfileScreen extends React.Component{
  
  render() {
    const { username } = this.props.route.params
    const is_muted = Auth.selected_user?.muting?.is_muted(username)
    const is_blocked = Auth.selected_user?.muting?.blocked_users.some(u => u.username === username)
    
    return(
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				{
          Auth.is_logged_in() && !Auth.is_selecting_user && !App.should_reload_web_view() ?
            is_muted || is_blocked ?
              <MutedMessage title={`@${username} is ${is_blocked ? "blocked" : "muted"}`} username={username} />
              :
              <WebViewModule endpoint={`hybrid/posts/${username}`} component_id={this.props.componentId} profile={Auth.is_logged_in() && !Auth.is_selecting_user ? <ProfileHeader username={username} /> : null} />
          :
          <LoginMessage title="User posts" />
        }
        <ImageModalModule />
      </View>
    )
  }
  
}
