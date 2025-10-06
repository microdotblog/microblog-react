import * as React from 'react';
import { observer } from 'mobx-react';
import { TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import Auth from './../../stores/Auth';
import App from '../../stores/App';
import { isLiquidGlass } from './../../utils/ui';

@observer
export default class ProfileImage extends React.Component{
  
  render() {
    let button_style = {
      width: 28,
      height: 28,
      marginRight: 12
    };
    
    if (isLiquidGlass()) {
      button_style = {
        paddingLeft: 4,
        paddingTop: 2
      }
    }
    
    if(Auth.selected_user != null){
      return(
        <TouchableOpacity style={button_style}
          onPress={() => { App.open_sheet("main_sheet"); Auth.selected_user.check_token_validity()} }
          onLongPress={() => App.navigate_to_screen("user", Auth.selected_user.username)}
          accessibilityRole="button"
          accessibilityLabel={`Profile menu for ${Auth.selected_user.username}`}
        >
          {
            Auth.selected_user.avatar != null && Auth.selected_user.avatar !== "" ?
            <Image
              source={{
                uri: `${Auth.selected_user.avatar}?v=${App.now()}`
              }}
              contentFit="contain"
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