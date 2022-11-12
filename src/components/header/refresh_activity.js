import * as React from 'react';
import { observer } from 'mobx-react';
import { ActivityIndicator } from 'react-native';
import Replies from './../../stores/Replies';

@observer
export default class RefreshActivity extends React.Component{
  
  render() {
   return(
    <ActivityIndicator color="#f80" animating={Replies.is_loading}  />
   )
  }
  
}