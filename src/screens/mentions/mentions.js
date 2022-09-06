import * as React from 'react';
import { observer } from 'mobx-react';
import Auth from './../../stores/Auth';
import { Navigation } from 'react-native-navigation';
import Push from '../../stores/Push'
import GenericScreenComponent from '../../components/generic/generic_screen'

@observer
export default class MentionsScreen extends React.Component{

  constructor (props) {
		super(props)
		Navigation.events().bindComponent(this)
  }

  componentDidAppear = async () => {
    Push.clear_notifications()
  }

  render() {
    return (
      <GenericScreenComponent
        can_show_web_view={Auth.is_logged_in() && !Auth.is_selecting_user && !Auth.selected_user.muting?.is_sending_mute && !Auth.selected_user.muting?.is_sending_unmute}
        endpoint="hybrid/mentions"
        component_id={this.props.componentId}
        title="Mentions"
      />
    )
  }

}
