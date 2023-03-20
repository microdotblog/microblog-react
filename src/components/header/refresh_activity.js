import * as React from 'react';
import { observer } from 'mobx-react';
import { ActivityIndicator, Platform } from 'react-native';
import Replies from './../../stores/Replies';
import Auth from './../../stores/Auth';

@observer
export default class RefreshActivity extends React.Component{
  
  render() {
    let is_loading = false
    switch(this.props.type){
      case "posts":
        is_loading = Auth.selected_user.posting.selected_service.is_loading_posts
        break;
      case "pages":
        is_loading = Auth.selected_user.posting.selected_service.is_loading_pages
        break;
      default:
      is_loading = Replies.is_loading
    }
    return(
      <ActivityIndicator style={{ marginRight: Platform.OS === "android" ? 8 : 0 }} color="#f80" animating={is_loading}  />
    )
  }
  
}