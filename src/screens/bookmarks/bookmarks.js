import * as React from 'react';
import { observer } from 'mobx-react';
import Auth from './../../stores/Auth';
import GenericScreenComponent from '../../components/generic/generic_screen'
import HighlightsHeader from '../../components/bookmarks/highlights';
import App from './../../stores/App';

@observer
export default class BookmarksScreen extends React.Component{

  constructor (props) {
		super(props)
  }

  componentDidMount() {
    if(Auth.is_logged_in() && Auth.selected_user != null){
      Auth.selected_user.fetch_highlights()
      Auth.selected_user.fetch_tags()
      Auth.selected_user.fetch_recent_tags()
    }
  }

  render() {
    return (
      <>
      {
        Auth.is_logged_in() && Auth.selected_user?.bookmark_highlights?.length > 0 ?
        <HighlightsHeader />
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
