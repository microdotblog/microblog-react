import * as React from 'react';
import { observer } from 'mobx-react';
import { TouchableOpacity, Platform } from 'react-native';
import App from './../../stores/App';
import { SFSymbol } from 'react-native-sfsymbols';
import { SvgXml } from 'react-native-svg';

@observer
export default class BackButton extends React.Component {

  render() {    
    return (
      <TouchableOpacity
      style={{
        marginLeft: 0,
        width: 30,
        height: 30,
        justifyContent: 'center'
      }}
        onPress={() => {
          this.props.navigation.goBack();
        }}>
        {
          Platform.OS === 'ios' ?
            <SFSymbol
              name={'chevron.left'}
              color={App.theme_text_color()}
              style={{ height: 20, width: 14 }}
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
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>'
            />
        }
      </TouchableOpacity>
    )
  }

}