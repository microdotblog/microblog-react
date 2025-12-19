import * as React from 'react'
import { observer } from 'mobx-react'
import { Platform, Pressable } from 'react-native'
import App from './../../stores/App'
import { isLiquidGlass, STANDARD_SLOP } from './../../utils/ui'
import { SFSymbol } from 'react-native-sfsymbols'
import { SvgXml } from 'react-native-svg'
import { HeaderBackButton } from '@react-navigation/elements'
import { useNavigation } from '@react-navigation/native'

const BackButtonContent = observer(() => {
  const navigation = useNavigation()
  const hit_slop = { top: STANDARD_SLOP, bottom: STANDARD_SLOP, left: STANDARD_SLOP, right: STANDARD_SLOP }
  let button_style = {}
  
  if (isLiquidGlass()) {
    button_style = {
      marginRight: 0 - STANDARD_SLOP,
      marginLeft: 16 - STANDARD_SLOP,
      marginTop: 2 - STANDARD_SLOP,
      marginBottom: 0 - STANDARD_SLOP,
      padding: STANDARD_SLOP,
      minWidth: 44,
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center'
    }
  }
  else {    
    button_style = {      
      marginLeft: -20,
      marginRight: 0,
      marginTop: -10,
      marginBottom: -10,
      paddingLeft: 20,
      paddingRight: 12,
      paddingTop: 10,
      paddingBottom: 10,
      minWidth: 44,
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center'
    }
  }
  const handle_press = () => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    }
  }
  const back_icon = Platform.OS === 'ios' ?
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

  if (Platform.OS === 'ios') {
    return (
      <Pressable
        onPress={handle_press}
        style={button_style}
        hitSlop={hit_slop}
        accessibilityRole="button"
        accessibilityLabel="Back"
      >
        {back_icon}
      </Pressable>
    )
  }

  return (
    <HeaderBackButton
      onPress={handle_press}
      style={button_style}
      labelVisible={false}
      backImage={() => back_icon}
    />
  )
})

@observer
export default class BackButton extends React.Component {
  render() {    
    return <BackButtonContent />
  }
}
