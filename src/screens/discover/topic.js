import * as React from 'react';
import { observer } from 'mobx-react';
import Auth from './../../stores/Auth';
import GenericScreenComponent from '../../components/generic/generic_screen';

@observer
export default class DiscoverTopicScreen extends React.Component{

  render() {
    return (
      <GenericScreenComponent
        can_show_web_view={Auth.is_logged_in() && !Auth.is_selecting_user && !Auth.selected_user.muting?.is_sending_mute && !Auth.selected_user.muting?.is_sending_unmute && !App.should_reload_web_view()}
        endpoint={`hybrid/discover/${this.props.route.params.topic.name}`}
        component_id={this.props.route.key}
        title="Discover"
      />
    )
  }

}
