import * as React from 'react';
import { observer } from 'mobx-react';
import Auth from './../../stores/Auth';
import App from './../../stores/App';
import GenericScreenComponent from '../../components/generic/generic_screen';

@observer
export default class BookmarkScreen extends React.Component{

  render() {
    return (
      <GenericScreenComponent
        can_show_web_view={Auth.is_logged_in() && !Auth.is_selecting_user && !App.is_loading_bookmarks}
        endpoint={`hybrid/bookmarks/${this.props.bookmark_id}`}
        component_id={this.props.componentId}
        title="Bookmarks"
      />
    )
  }

}
