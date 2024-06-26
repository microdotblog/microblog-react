import * as React from 'react';
import { observer } from 'mobx-react';
import { TouchableOpacity, Platform } from 'react-native';
import App from './../../stores/App';
import { SFSymbol } from 'react-native-sfsymbols';
import { SvgXml } from 'react-native-svg';

@observer
export default class CloseModalButton extends React.Component {

  render() {
    return (
      <TouchableOpacity
        onPress={() => App.go_back()}
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