import * as React from 'react';
import { observer } from 'mobx-react';
import { View } from 'react-native';
import Auth from './../../stores/Auth';
import LoginMessage from './../../components/info/login_message';
import WebViewModule from '../../components/web/webview_module'
import ImageModalModule from '../../components/images/image_modal'
import { Navigation } from 'react-native-navigation';
import { addBoomarkScreen } from '..'

@observer
export default class BookmarksScreen extends React.Component{

  constructor (props) {
		super(props)
		Navigation.events().bindComponent(this)
  }

  navigationButtonPressed = async ({ buttonId }) => {
    console.log("navigationButtonPressed::", buttonId)
    if(buttonId === "add_bookmark_button"){
      addBoomarkScreen()
    }
  }

  render() {
    return(
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {
          Auth.is_logged_in() && !Auth.is_selecting_user ?
          <WebViewModule endpoint="hybrid/favorites" component_id={this.props.componentId} />
          :
          <LoginMessage title="Bookmarks" />
        }
        <ImageModalModule />
      </View>
    )
  }

}
