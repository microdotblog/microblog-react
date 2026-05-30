import * as React from 'react'
import { Dimensions, Keyboard, View } from 'react-native'

export default class EditorKeyboardAvoidingView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      keyboard_height: 0
    }
    this.keyboard_show_listener = null
    this.keyboard_hide_listener = null
  }

  componentDidMount() {
    this.keyboard_show_listener = Keyboard.addListener('keyboardWillChangeFrame', this.handleKeyboardChange)
    this.keyboard_hide_listener = Keyboard.addListener('keyboardWillHide', this.handleKeyboardHide)
  }

  componentWillUnmount() {
    this.keyboard_show_listener?.remove()
    this.keyboard_hide_listener?.remove()
  }

  keyboardHeight(event) {
    const screen_y = event?.endCoordinates?.screenY
    if (screen_y != null) {
      const window_height = Dimensions.get('window').height
      return Math.max(0, window_height - screen_y)
    }

    return Math.max(0, event?.endCoordinates?.height || 0)
  }

  handleKeyboardChange = (event) => {
    Keyboard.scheduleLayoutAnimation?.(event)
    this.setState({
      keyboard_height: this.keyboardHeight(event)
    })
  }

  handleKeyboardHide = (event) => {
    Keyboard.scheduleLayoutAnimation?.(event)
    this.setState({
      keyboard_height: 0
    })
  }

  render() {
    const { children, style, ...props } = this.props

    return (
      <View
        {...props}
        style={[
          style,
          {
            marginBottom: this.state.keyboard_height
          }
        ]}
      >
        {children}
      </View>
    )
  }
}
