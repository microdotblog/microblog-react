import * as React from 'react';
import { observer } from 'mobx-react';
import { TouchableOpacity, Image, Platform } from 'react-native';
import Auth from './../../stores/Auth';
import { postingScreen } from './../../screens'
import PostAddIcon from './../../assets/icons/post_add.png';
import App from '../../stores/App'
import { SFSymbol } from "react-native-sfsymbols";

@observer
export default class NewPostButton extends React.Component{
  
  render() {
    if(Auth.selected_user != null && Auth.selected_user.posting?.posting_enabled()){
      return(
        <TouchableOpacity style={{ width: 40, height: 30, justifyContent: 'center', alignItems: 'center' }}
          onPress={() => postingScreen()}
        >
          {
            Platform.OS === 'ios' ? 
              <SFSymbol
                name="square.and.pencil"
                color={App.theme_text_color()}
                style={{ width: 26, height: 26 }}
              />
            :
            <Image source={PostAddIcon} style={{ width: 30, height: 30, tintColor: App.theme_text_color() }} />
          }
          
        </TouchableOpacity>
      )
    }
    return null
  }
  
}