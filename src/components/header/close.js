import * as React from 'react'
import { observer } from 'mobx-react'
import { Pressable, TouchableOpacity, Platform } from 'react-native'
import App from './../../stores/App'
import { isLiquidGlass, STANDARD_SLOP } from './../../utils/ui'
import { SFSymbol } from 'react-native-sfsymbols'
import { SvgXml } from 'react-native-svg'

@observer
export default class CloseModalButton extends React.Component {

  render() {
    const hit_slop = { top: STANDARD_SLOP, bottom: STANDARD_SLOP, left: STANDARD_SLOP, right: STANDARD_SLOP }
    let button_style = {
      marginLeft: -15,
      paddingHorizontal: 12,
      paddingVertical: 8,
      minWidth: 44,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row'
    }
    
    if (isLiquidGlass()) {
      button_style = {
        paddingLeft: 7,
        paddingTop: 4,
        minWidth: 44,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
      }
    }

    const handle_press = () => App.go_back()
    const close_icon = Platform.OS === 'ios' ?
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

    if (Platform.OS === 'ios') {
      return (
        <Pressable
          onPress={handle_press}
          style={button_style}
          hitSlop={hit_slop}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          {close_icon}
        </Pressable>
      )
    }

    return (
      <TouchableOpacity
        onPress={handle_press}
        style={button_style}
        hitSlop={hit_slop}
        accessibilityRole="button"
        accessibilityLabel="Close"
      >
        {close_icon}
      </TouchableOpacity>
    )
  }

}
