import * as React from 'react';
import { observer } from 'mobx-react';
import { View } from 'react-native';
import Auth from './../../stores/Auth';
import LoginMessage from './../../components/info/login_message';
import WebViewModule from '../../components/web/webview_module'
import ImageModalModule from '../../components/images/image_modal'

@observer
export default class DiscoverTopicScreen extends React.Component{

  render() {
    return(
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {
          Auth.is_logged_in() && !Auth.is_selecting_user ?
          <WebViewModule endpoint={`hybrid/discover/${this.props.topic_name}`} />
          :
          <LoginMessage title="Discover" />
        }
        <ImageModalModule />
      </View>
    )
  }

}
