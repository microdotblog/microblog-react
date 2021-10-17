import * as React from 'react';
import { observer } from 'mobx-react';
import { TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import Auth from './../../stores/Auth';

@observer
export default class ProfileImage extends React.Component{
  
  render() {
    if(Auth.selected_user != null){
      return(
        <TouchableOpacity style={{ width: 40, height: 30, paddingRight: 5 }}>
          <FastImage
            source={{
              uri: Auth.selected_user.avatar,
              priority: FastImage.priority.normal,
              cache: FastImage.cacheControl.web
            }}
            resizeMode={FastImage.resizeMode.contain}
            style={{ width: 30, height: 30, borderRadius: 50, paddingRight: 2 }}
          />
        </TouchableOpacity>
      )
    }
    return null
  }
  
}