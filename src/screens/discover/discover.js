import * as React from 'react';
import { observer } from 'mobx-react';
import { View } from 'react-native';
import Auth from './../../stores/Auth';
import LoginMessage from './../../components/info/login_message';
import WebViewModule from '../../components/web/webview_module'
import ImageModalModule from '../../components/images/image_modal'
import TagmojiBar from '../../components/discover/tagmoji_bar'
import Discover from '../../stores/Discover'

@observer
export default class DiscoverScreen extends React.Component{

  componentDidMount() {
    Discover.init()
  }

  render() {
    return(
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {
          Auth.is_logged_in() && !Auth.is_selecting_user ?
          <>
            <TagmojiBar />
            <WebViewModule endpoint="hybrid/discover" component_id={this.props.componentId} />
          </>
          :
          <LoginMessage title="Discover" />
        }
        <ImageModalModule />
      </View>
    )
  }

}
