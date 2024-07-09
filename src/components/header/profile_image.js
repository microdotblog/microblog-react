import * as React from 'react';
import { observer } from 'mobx-react';
import { TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import Auth from './../../stores/Auth';
import { menuBottomSheet } from './../../screens'
import App from '../../stores/App';

@observer
export default class ProfileImage extends React.Component{
  
  render() {
    if(Auth.selected_user != null){
      return(
        <TouchableOpacity style={{ width: 28, height: 28, marginRight: 12 }}
          onPress={() => {menuBottomSheet(); Auth.selected_user.check_token_validity()}}
          onLongPress={() => App.navigate_to_screen("user", Auth.selected_user.username)}
        >
          {
            Auth.selected_user.avatar != null && Auth.selected_user.avatar !== "" ?
            <FastImage
              source={{
                uri: `${Auth.selected_user.avatar}?v=${App.now()}`,
                priority: FastImage.priority.normal,
                cache: FastImage.cacheControl.web
              }}
              resizeMode={FastImage.resizeMode.contain}
              style={{ width: 28, height: 28, borderRadius: 50 }}
            />
            :
            <View style={{ width: 28, height: 28, borderRadius: 50, backgroundColor: App.theme_border_color() }}></View>
          }
          
        </TouchableOpacity>
      )
    }
    return null
  }
  
}