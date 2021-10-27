import * as React from 'react';
import { observer } from 'mobx-react';
import { View } from 'react-native';
import Auth from './../../stores/Auth';
import LoginMessage from './../../components/info/login_message';
import { WebView } from 'react-native-webview';

@observer
export default class DiscoverScreen extends React.Component{
  
  render() {
    return(
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {
          Auth.is_logged_in() && !Auth.is_selecting_user ?
          <WebView
            source={{ uri: `https://micro.blog/hybrid/discover`, headers: {
              'Authorization' : `Bearer ${Auth.selected_user.token()}`
            }}}
            containerStyle={{ flex: 1, width: '100%', height: '100%' }}
            startInLoadingState={true}
          />
          :
          <LoginMessage title="Discover" />
        }
      </View>
    )
  }
  
}