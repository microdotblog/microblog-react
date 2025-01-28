import * as React from 'react';
import { observer } from 'mobx-react';
import Auth from './../../stores/Auth';
import GenericScreenComponent from '../../components/generic/generic_screen'
import App from './../../stores/App';
import TagFilterHeader from '../../components/bookmarks/tag_filter_header';

@observer
export default class BookmarksScreen extends React.Component{

  render() {
    return (
      <>
      {
        Auth.is_logged_in() && Auth.selected_user?.selected_tag != null ?
        <TagFilterHeader />
        : null
      }
      <GenericScreenComponent
        can_show_web_view={Auth.is_logged_in() && !Auth.is_selecting_user && !App.should_reload_web_view() && !App.is_loading_bookmarks}
        endpoint={Auth.is_logged_in() && Auth.selected_user?.selected_tag != null ? `hybrid/favorites?tag=${Auth.selected_user?.selected_tag}&show_tags=1` : "hybrid/favorites?show_tags=1"}
        component_id={this.props.componentId}
        title="Bookmarks"
        loading_text="Loading bookmarks..."
        is_filtered={Auth.selected_user?.selected_tag != null}
      />
      </>
    )
  }

}
