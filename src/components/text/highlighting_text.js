import * as React from 'react'
import { observer } from 'mobx-react'
import { requireNativeComponent, Platform } from 'react-native'
import App from '../../stores/App'

const MBHighlightingTextView = requireNativeComponent('MBHighlightingTextView')

@observer
export default class HighlightingText extends React.Component {
  render() {
    const colorScheme = this.props.colorScheme || App.theme

    if (Platform.OS === 'ios') {
      return <MBHighlightingTextView {...this.props} colorScheme={colorScheme} />
    }

    const {
      onChangeText,
      ...props
    } = this.props

    return (
      <MBHighlightingTextView
        {...props}
        colorScheme={colorScheme}
        onChange={onChangeText}
      />
    )
  }
}
