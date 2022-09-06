import * as React from 'react';
import { observer } from 'mobx-react';
import Auth from '../../stores/Auth';
import { Navigation } from 'react-native-navigation';
import { replyScreen } from '..'
import Reply from '../../stores/Reply'
import GenericScreenComponent from '../../components/generic/generic_screen'
import App from '../../stores/App'

@observer
export default class ConversationScreen extends React.Component{

  constructor (props) {
		super(props)
		Navigation.events().bindComponent(this)
  }
  
  navigationButtonPressed = async ({ buttonId }) => {
    if(buttonId === "reply_button" && Reply.conversation_id){
      replyScreen()
    }
  }
  
  render() {
    return (
      <GenericScreenComponent
        can_show_web_view={Auth.is_logged_in() && !Auth.is_selecting_user && !Reply.is_sending_reply && !Auth.selected_user.muting?.is_sending_mute && !Auth.selected_user.muting?.is_sending_unmute}
        endpoint={`hybrid/conversation/${ this.props.conversation_id }?show_actions=true&theme=${App.theme}#post_${ this.props.conversation_id }`}
        component_id={this.props.componentId}
        title="Conversation"
        loading_text="Loading conversation..."
      />
    )
  }
  
}