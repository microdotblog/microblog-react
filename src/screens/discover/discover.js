import * as React from 'react';
import { observer } from 'mobx-react';
import Auth from './../../stores/Auth';
import TagmojiBar from '../../components/discover/tagmoji_bar'
import Discover from '../../stores/Discover'
import GenericScreenComponent from '../../components/generic/generic_screen';

@observer
export default class DiscoverScreen extends React.Component{

  componentDidMount() {
    Discover.init()
  }

  render() {
    return (
      <>
      <TagmojiBar />
      <GenericScreenComponent
        can_show_web_view={Auth.is_logged_in() && !Auth.is_selecting_user && !Auth.selected_user.muting?.is_sending_mute && !Auth.selected_user.muting?.is_sending_unmute && !Discover.should_load_search()}
        endpoint={Discover.can_show_search() ? `hybrid/discover/search?q=${Discover.search_query}` : "hybrid/discover"}
        component_id={this.props.componentId}
        title={Discover.can_show_search() ? "Search" : "Discover"}
        is_search={Discover.can_show_search()}
      />
      </>
    )
  }

}
