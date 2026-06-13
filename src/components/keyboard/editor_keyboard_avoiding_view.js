import * as React from 'react'
import { Dimensions, Keyboard, View } from 'react-native'
import { runOnJS } from 'react-native-reanimated'
import { useKeyboardHandler, useKeyboardState } from 'react-native-keyboard-controller'

const DEBUG_EDITOR_LAYOUT = true

export const EditorKeyboardFrameContext = React.createContext({
  height: 0,
  keyboard_height: 0,
  window_y: 0,
  window_bottom: 0
})

class EditorKeyboardAvoidingContent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      content_height: 0,
      keyboard_height: 0,
      visible_height: 0,
      window_y: 0
    }
    this.container = React.createRef()
    this.keyboard_show_listener = null
    this.keyboard_hide_listener = null
  }

  componentDidUpdate(prevProps) {
    if (prevProps.keyboard_height !== this.props.keyboard_height) {
      this.updateKeyboardHeight(this.props.keyboard_height)
    }
  }

  componentDidMount() {
    this.keyboard_show_listener = Keyboard.addListener('keyboardWillChangeFrame', this.handleKeyboardChange)
    this.keyboard_hide_listener = Keyboard.addListener('keyboardWillHide', this.handleKeyboardHide)
    this.updateKeyboardHeight(this.props.keyboard_height)
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
    this.updateKeyboardHeight(this.keyboardHeight(event))
  }

  handleKeyboardHide = (event) => {
    Keyboard.scheduleLayoutAnimation?.(event)
    this.updateKeyboardHeight(0)
  }

  updateKeyboardHeight(keyboard_height) {
    const next_keyboard_height = Math.max(0, keyboard_height || 0)
    const next_visible_height = this.visibleHeight(this.state.content_height, next_keyboard_height)

    this.setState({
      keyboard_height: next_keyboard_height,
      visible_height: next_visible_height
    }, this.measureInWindow)
  }

  measureInWindow = () => {
    this.container.current?.measureInWindow((x, y) => {
      if (y !== this.state.window_y) {
        this.setState({
          window_y: y
        })
      }
    })
  }

  handleLayout = (event) => {
    this.props.onLayout?.(event)

    if (this.state.keyboard_height > 0) {
      return
    }

    const height = event?.nativeEvent?.layout?.height || 0
    if (height > 0 && height !== this.state.content_height) {
      this.setState({
        content_height: height,
        visible_height: this.visibleHeight(height, this.state.keyboard_height)
      }, this.measureInWindow)
    }
  }

  visibleHeight(content_height, keyboard_height) {
    return Math.max(0, content_height - keyboard_height)
  }

  render() {
    const view_props = {
      ...this.props
    }
    delete view_props.keyboard_height

    const { children, style, ...props } = view_props
    const should_avoid_keyboard = this.state.keyboard_height > 0 && this.state.content_height > 0
    const debug_style = DEBUG_EDITOR_LAYOUT ? {
      borderColor: '#8e24aa',
      borderWidth: 4,
      backgroundColor: 'rgba(142, 36, 170, 0.12)'
    } : null
    const keyboard_style = should_avoid_keyboard ?
      {
        height: this.state.visible_height,
        flex: 0,
        marginBottom: this.state.keyboard_height
      }
      :
      {
        marginBottom: 0
      }

    return (
      <View
        ref={this.container}
        {...props}
        onLayout={this.handleLayout}
        style={[
          style,
          debug_style,
          keyboard_style
        ]}
      >
        <EditorKeyboardFrameContext.Provider value={{
          height: this.state.visible_height || this.state.content_height,
          keyboard_height: this.state.keyboard_height,
          window_y: this.state.window_y,
          window_bottom: this.state.window_y + (this.state.visible_height || this.state.content_height)
        }}>
          {children}
        </EditorKeyboardFrameContext.Provider>
      </View>
    )
  }
}

export default function EditorKeyboardAvoidingView(props) {
  const keyboard_state_height = useKeyboardState((state) => {
    return state.height
  })
  const [keyboard_event_height, setKeyboardEventHeight] = React.useState(0)

  useKeyboardHandler({
    onStart: (event) => {
      'worklet'
      runOnJS(setKeyboardEventHeight)(Math.abs(event.height || 0))
    },
    onMove: (event) => {
      'worklet'
      runOnJS(setKeyboardEventHeight)(Math.abs(event.height || 0))
    },
    onInteractive: (event) => {
      'worklet'
      runOnJS(setKeyboardEventHeight)(Math.abs(event.height || 0))
    },
    onEnd: (event) => {
      'worklet'
      runOnJS(setKeyboardEventHeight)(Math.abs(event.height || 0))
    }
  }, [])

  const keyboard_height = Math.max(keyboard_state_height || 0, keyboard_event_height || 0)

  return (
    <EditorKeyboardAvoidingContent
      {...props}
      keyboard_height={keyboard_height}
    />
  )
}
