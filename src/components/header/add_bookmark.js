import * as React from 'react';
import { observer } from 'mobx-react';
import { TouchableOpacity, Platform } from 'react-native';
import Auth from './../../stores/Auth';
import App from '../../stores/App'
import { SFSymbol } from "react-native-sfsymbols";
import { SvgXml } from 'react-native-svg';
import { HEADER_BUTTON_HIT_SLOP, isLiquidGlass } from './../../utils/ui';

@observer
export default class AddBookmarkButton extends React.Component{
  
  render() {
    if(Auth.selected_user != null && Auth.selected_user.posting?.posting_enabled()){
      const button_style = isLiquidGlass() ?
        {
          width: 28,
          height: 28,
          justifyContent: 'center',
          alignItems: 'center'
        }
        :
        {
          height: 22,
          justifyContent: 'center',
          alignItems: 'center'
        }

      return(
        <TouchableOpacity 
          style={button_style}
          hitSlop={HEADER_BUTTON_HIT_SLOP}
          onPress={() => App.navigate_to_screen("add_bookmark")}
          accessibilityRole="button"
          accessibilityLabel="Add bookmark"
        >
          {
            Platform.OS === 'ios' ? 
              <SFSymbol
                name="plus"
                color={App.theme_text_color()}
                style={{ width: 22, height: 22 }}
              />
            :
            <SvgXml
              style={{
                height: 28,
                width: 28
              }}
              color={App.theme_text_color()}
              xml='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>'
            />
          }
          
        </TouchableOpacity>
      )
    }
    return null
  }
  
}
