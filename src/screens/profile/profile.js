import * as React from 'react';
import { observer } from 'mobx-react';
import { View } from 'react-native';
import Auth from './../../stores/Auth';
import WebViewModule from '../../components/web/webview_module'
import LoginMessage from '../../components/info/login_message'
import ImageModalModule from '../../components/images/image_modal'
import ProfileHeader from '../../components/profile/profile_header'

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
					Auth.is_logged_in() && !Auth.is_selecting_user ?
          <WebViewModule endpoint={`hybrid/posts/${this.props.username}`} component_id={this.props.componentId} />
          :
          <LoginMessage title="User posts" />
        }
        <ImageModalModule />
      </View>
    )
  }
  
}