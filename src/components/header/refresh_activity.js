import * as React from 'react';
import { observer } from 'mobx-react';
import { ActivityIndicator, Platform } from 'react-native';
import Replies from './../../stores/Replies';
import Auth from './../../stores/Auth';
import App from './../../stores/App';
import { isLiquidGlass } from './../../utils/ui';

@observer
export default class RefreshActivity extends React.Component{
  
  render() {
    let is_loading = false
    switch(this.props.type){
      case "posts":
        is_loading = Auth.selected_user.posting.selected_service.is_loading_posts || App.is_searching_posts
        break;
      case "pages":
        is_loading = Auth.selected_user.posting.selected_service.is_loading_pages || App.is_searching_pages
        break;
      case "uploads":
        is_loading = Auth.selected_user.posting.selected_service.is_loading_uploads
        break;
      case "highlights":
        is_loading = App.is_loading_highlights
        break;
      default:
      is_loading = Replies.is_loading
    }
    if (isLiquidGlass() && !is_loading) {
      return null
    }

    const style = isLiquidGlass() ?
      { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }
      :
      { marginRight: Platform.OS === "android" ? 8 : 0 }

    return(
      <ActivityIndicator style={style} color={App.theme_accent_color()} animating={is_loading}  />
    )
  }
  
}
