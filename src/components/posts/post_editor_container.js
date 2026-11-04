import * as React from 'react'
import { observer } from 'mobx-react'
import { BackHandler, View } from 'react-native'

@observer
export default class PostEditorContainer extends React.Component {
  componentDidMount() {
    this.back_listener = BackHandler.addEventListener('hardwareBackPress', () => {
      const { posting } = this.props
      return posting.is_sending_post && !posting.is_closing_after_post
    })
  }

  componentWillUnmount() {
    this.back_listener?.remove()
    const { posting } = this.props
    if (posting.is_closing_after_post) {
      posting.clear_post()
    }
  }

  render() {
    const { posting, children, style } = this.props
    const is_disabled = posting.is_sending_post || posting.is_closing_after_post
    return (
      <View
        style={[{ flex: 1 }, style]}
        pointerEvents={is_disabled ? 'none' : 'auto'}
        accessibilityElementsHidden={is_disabled}
        importantForAccessibility={is_disabled ? 'no-hide-descendants' : 'auto'}
      >
        {children}
      </View>
    )
  }
}
