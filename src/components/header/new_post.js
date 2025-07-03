import * as React from 'react';
import { observer } from 'mobx-react';
import { TouchableOpacity, Image, Platform } from 'react-native';
import Auth from './../../stores/Auth';
import PostAddIcon from './../../assets/icons/post_add.png';
import App from '../../stores/App'
import { isLiquidGlass } from './../../utils/ui';
import { SFSymbol } from "react-native-sfsymbols";

@observer
export default class NewPostButton extends React.Component{
  
  render() {
    let button_style = {
      justifyContent: 'center',
      alignItems: 'center'
    };

    if (isLiquidGlass()) {
      button_style.paddingLeft = 4;
    }
    
    if(Auth.selected_user != null && Auth.selected_user.posting?.posting_enabled()){
      return (
        <TouchableOpacity 
          style={button_style}
          onPress={() => App.navigate_to_screen("Posting")}
          accessibilityRole="button"
          accessibilityLabel="New post"
        >
          {
            Platform.OS === 'ios' ? 
              <SFSymbol
                name="square.and.pencil"
                color={App.theme_text_color()}
                style={{ width: 28, height: 28 }}
              />
            :
            <Image source={PostAddIcon} style={{ width: 28, height: 28, tintColor: App.theme_text_color() }} />
          }
          
        </TouchableOpacity>
      )
    }
    return null
  }
  
}