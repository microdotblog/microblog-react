import * as React from 'react';
import { observer } from 'mobx-react';
import { View } from 'react-native';
import Auth from '../../stores/Auth';
import WebViewModule from '../../components/web/webview_module'
import LoginMessage from '../../components/info/login_message'
import ImageModalModule from '../../components/images/image_modal'
import { Navigation } from 'react-native-navigation';
import { replyScreen } from '..'
import Reply from '../../stores/Reply'

@observer
export default class ConversationScreen extends React.Component{

  constructor (props) {
		super(props)
		Navigation.events().bindComponent(this)
  }
  
  navigationButtonPressed = async ({ buttonId }) => {
		console.log("ConversationScreen:navigationButtonPressed::", buttonId)
    if(buttonId === "reply_button" && Reply.conversation_id){
      replyScreen()
    }
  }
  
  render() {
    return(
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				{
					Auth.is_logged_in() && !Auth.is_selecting_user && !Reply.is_sending_reply ?
					<WebViewModule endpoint={`hybrid/conversation/${this.props.conversation_id}?show_actions=true#post_${this.props.conversation_id}`} />
          :
          <LoginMessage title="Conversation" />
        }
        <ImageModalModule />
      </View>
    )
  }
  
}