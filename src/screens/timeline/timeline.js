import * as React from 'react';
import { observer } from 'mobx-react';
import { Platform } from 'react-native';
import Auth from './../../stores/Auth';
import GenericScreenComponent from '../../components/generic/generic_screen';
import App from '../../stores/App'
import { SheetProvider } from "react-native-actions-sheet";


@observer
export default class TimelineScreen extends React.Component{

  render() {
    return(
      <>
      {
        Platform.OS === "android" && <SheetProvider />
      }
      <GenericScreenComponent
        can_show_web_view={Auth.is_logged_in() && !Auth.is_selecting_user && !Auth.selected_user.muting?.is_sending_mute && !Auth.selected_user.muting?.is_sending_unmute && !App.should_reload_web_view()}
        endpoint="hybrid/posts"
        component_id={this.props.componentId}
        title="Timeline"
      />
      </>
    )
  }

}
