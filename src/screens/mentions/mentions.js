import * as React from 'react';
import { observer } from 'mobx-react';
import Auth from './../../stores/Auth';
import Push from '../../stores/Push'
import GenericScreenComponent from '../../components/generic/generic_screen'

@observer
export default class MentionsScreen extends React.Component{

  constructor (props) {
		super(props)
  }

  componentDidAppear = async () => {
    Push.clear_notifications()
  }

  render() {
    return (
      <GenericScreenComponent
        can_show_web_view={Auth.is_logged_in() && !Auth.is_selecting_user && !Auth.selected_user.muting?.is_sending_mute && !Auth.selected_user.muting?.is_sending_unmute && !App.should_reload_web_view()}
        endpoint="hybrid/mentions"
        component_id={this.props.componentId}
        title="Mentions"
        loading_text="Loading mentions..."
      />
    )
  }

}
