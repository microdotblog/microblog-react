import * as React from 'react'
import { Platform, requireNativeComponent } from 'react-native'
import { isLiquidGlass } from '../../utils/ui'

const NativeLiquidGlassButton = Platform.OS === 'ios' ? requireNativeComponent('MBLiquidGlassButton') : null

export default class LiquidGlassButton extends React.Component {
  render() {
    if (!isLiquidGlass() || NativeLiquidGlassButton == null) {
      return null
    }

    const { disabled, style, onPress, ...props } = this.props
    return (
      <NativeLiquidGlassButton
        {...props}
        pointerEvents={disabled ? 'none' : 'auto'}
        accessibilityState={{ disabled: !!disabled }}
        style={[style, disabled ? { opacity: 0.5 } : null]}
        onPress={disabled ? undefined : onPress}
      />
    )
  }
}
