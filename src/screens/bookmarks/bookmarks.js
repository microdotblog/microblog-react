import * as React from 'react';
import { observer } from 'mobx-react';
import Auth from './../../stores/Auth';
import { Navigation } from 'react-native-navigation';
import { addBoomarkScreen } from '..'
import GenericScreenComponent from '../../components/generic/generic_screen'

@observer
export default class BookmarksScreen extends React.Component{

  constructor (props) {
		super(props)
		Navigation.events().bindComponent(this)
  }

  navigationButtonPressed = async ({ buttonId }) => {
    console.log("navigationButtonPressed::", buttonId)
    if(buttonId === "add_bookmark_button"){
      addBoomarkScreen()
    }
  }

  render() {
    return (
      <GenericScreenComponent
        can_show_web_view={Auth.is_logged_in() && !Auth.is_selecting_user}
        endpoint="hybrid/favorites"
        component_id={this.props.componentId}
        title="Bookmarks"
        loading_text="Loading bookmarks..."
      />
    )
  }

}
