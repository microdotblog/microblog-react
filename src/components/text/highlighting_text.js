import * as React from 'react'
import { observer } from 'mobx-react'
import { requireNativeComponent, Platform, TextInput } from 'react-native'
import App from '../../stores/App'

const MBHighlightingTextView = requireNativeComponent('MBHighlightingTextView')

@observer
export default class HighlightingText extends React.Component {
  render() {
    if (Platform.OS === 'ios') {
      return <MBHighlightingTextView {...this.props} colorScheme={this.props.colorScheme || App.theme} />
    }

    return <TextInput {...this.props} />
  }
}
