import * as React from 'react';
import { observer } from 'mobx-react';
import Auth from './../../stores/Auth';
import GenericScreenComponent from '../../components/generic/generic_screen'

@observer
export default class FollowingScreen extends React.Component{
  
  render() {
    return (
      <GenericScreenComponent
        can_show_web_view={Auth.is_logged_in() && !Auth.is_selecting_user && !App.should_reload_web_view()}
        endpoint={
          this.props.username == Auth.selected_user.username ?
          `hybrid/following/${ this.props.route.params.username }` :
          `hybrid/users/discover/${ this.props.route.params.username }`
        }
        component_id={this.props.componentId}
        title="Users following"
        loading_text="Loading users..."
      />
    )
  }
  
}