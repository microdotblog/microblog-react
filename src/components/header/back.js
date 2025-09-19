import * as React from 'react';
import { observer } from 'mobx-react';
import { Platform } from 'react-native';
import App from './../../stores/App';
import { isLiquidGlass, STANDARD_SLOP } from './../../utils/ui';
import { SFSymbol } from 'react-native-sfsymbols';
import { SvgXml } from 'react-native-svg';
import { HeaderBackButton } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';

const BackButtonContent = observer(() => {
  const navigation = useNavigation();
  let button_style = {};
  
  if (isLiquidGlass()) {
    button_style = {
      marginRight: 0 - STANDARD_SLOP,
      marginLeft: 9 - STANDARD_SLOP,
      marginTop: 2 - STANDARD_SLOP,
      marginBottom: 0 - STANDARD_SLOP,
      padding: STANDARD_SLOP
    }
  }
  else {    
    button_style = {      
      marginLeft: -20,
      marginRight: 0,
      marginTop: -10,
      marginBottom: -10,
      paddingLeft: 20,
      paddingRight: 0,
      paddingTop: 10,
      paddingBottom: 10
    };
  }
  
  return (
    <HeaderBackButton
      onPress={() => {
        if (navigation.canGoBack()) {
          navigation.goBack()
        }
      }}
      style={button_style}
      labelVisible={false}
      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
      backImage={() => (
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
      )}
    />
  )
})

@observer
export default class BackButton extends React.Component {
  render() {    
    return <BackButtonContent />
  }
}