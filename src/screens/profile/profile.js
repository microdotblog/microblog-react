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
    return(
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {
          Auth.is_logged_in() && !Auth.is_selecting_user ? 
          <ProfileHeader username={this.props.username} />
          : null
        }
				{
          Auth.is_logged_in() && !Auth.is_selecting_user && !App.should_reload_web_view() ?
            Auth.selected_user.muting?.is_muted(this.props.username) ?
              <MutedMessage title={`@${this.props.username} is muted`} username={this.props.username} />
              :
              <WebViewModule endpoint={`hybrid/posts/${this.props.username}`} component_id={this.props.componentId} />
          :
          <LoginMessage title="User posts" />
        }
        <ImageModalModule />
      </View>
    )
  }
  
}