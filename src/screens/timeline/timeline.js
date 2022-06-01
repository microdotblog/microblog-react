import * as React from 'react';
import { observer } from 'mobx-react';
import Auth from './../../stores/Auth';
import GenericScreenComponent from '../../components/generic/generic_screen';

@observer
export default class TimelineScreen extends React.Component{

  render() {
    return(
      <GenericScreenComponent
        can_show_web_view={Auth.is_logged_in() && !Auth.is_selecting_user && !Auth.selected_user.muting?.is_sending_mute && !Auth.selected_user.muting?.is_sending_unmute}
        endpoint="hybrid/posts"
        component_id={this.props.componentId}
        title="Timeline"
      />
    )
  }

}
