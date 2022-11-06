import * as React from 'react';
import { observer } from 'mobx-react';
import { ActivityIndicator } from 'react-native';
import Auth from './../../stores/Auth';

@observer
export default class RefreshActivity extends React.Component{
  
  render() {
   return(
    <ActivityIndicator color="#f80" animating={Auth.selected_user.replies.is_loading}  />
   )
  }
  
}