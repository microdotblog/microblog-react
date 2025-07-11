import * as React from 'react';
import { observer } from 'mobx-react';
import { TouchableOpacity, Platform } from 'react-native';
import App from './../../stores/App';
import { isLiquidGlass } from './../../utils/ui';
import { SFSymbol } from 'react-native-sfsymbols';
import { SvgXml } from 'react-native-svg';

@observer
export default class ClosePostClearButton extends React.Component {

  render() {
    let button_style = {};
  
    if (isLiquidGlass()) {
      button_style.paddingLeft = 8;
      button_style.paddingTop = 5;
    }

    return (
      <TouchableOpacity
        onPress={() => {
          App.go_back_and_clear()
        }}
        style={button_style}
      >
        {
          Platform.OS === 'ios' ?
            <SFSymbol
              name={'xmark'}
              color={App.theme_text_color()}
              style={{ height: 20, width: 20 }}
            />
            :
            <SvgXml
              style={{
                height: 24,
                width: 24,
                marginRight: 7,
                marginTop: 2
              }}
              color={App.theme_text_color()}
              xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>'
            />
        }
      </TouchableOpacity>
    )
  }

}