import * as React from 'react'
import { Platform, requireNativeComponent } from 'react-native'
import { isLiquidGlass } from '../../utils/ui'

const NativeLiquidGlassButton = Platform.OS === 'ios' ? requireNativeComponent('MBLiquidGlassButton') : null

export default class LiquidGlassButton extends React.Component {
  render() {
    if (!isLiquidGlass() || NativeLiquidGlassButton == null) {
      return null
    }

    return <NativeLiquidGlassButton {...this.props} />
  }
}
