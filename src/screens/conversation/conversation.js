import * as React from 'react';
import { observer } from 'mobx-react';
import Auth from '../../stores/Auth';
import Reply from '../../stores/Reply'
import GenericScreenComponent from '../../components/generic/generic_screen'
import App from '../../stores/App'

@observer
export default class ConversationScreen extends React.Component{
  
  render() {
    return (
      <GenericScreenComponent
        can_show_web_view={Auth.is_logged_in() && !Auth.is_selecting_user && !Reply.is_sending_reply && !Auth.selected_user.muting?.is_sending_mute && !Auth.selected_user.muting?.is_sending_unmute && !App.should_reload_web_view()}
        endpoint={`hybrid/conversation/${ this.props.route.params.conversation_id }?show_actions=true&theme=${App.theme}#post_${ this.props.route.params.conversation_id }`}
        component_id={this.props.route.key}
        title="Conversation"
        loading_text="Loading conversation..."
      />
    )
  }
  
}