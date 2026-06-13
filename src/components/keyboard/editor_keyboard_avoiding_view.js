import * as React from 'react'
import { LayoutAnimation, View } from 'react-native'
import { runOnJS } from 'react-native-reanimated'
import { useKeyboardHandler } from 'react-native-keyboard-controller'

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
  }

  componentDidUpdate(prevProps) {
    if (prevProps.keyboard_height !== this.props.keyboard_height) {
      this.updateKeyboardHeight(this.props.keyboard_height)
    }
  }

  componentDidMount() {
    this.updateKeyboardHeight(this.props.keyboard_height)
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
  const [keyboard_event_height, setKeyboardEventHeight] = React.useState(0)

  const applyKeyboardHeight = React.useCallback((height, duration, should_animate) => {
    const next_height = Math.abs(height || 0)

    if (should_animate) {
      const animation_duration = duration > 0 && duration < 10 ? duration * 1000 : duration
      LayoutAnimation.configureNext({
        duration: animation_duration || 250,
        update: {
          type: LayoutAnimation.Types.keyboard
        }
      })
    }

    setKeyboardEventHeight(next_height)
  }, [])

  useKeyboardHandler({
    onStart: (event) => {
      'worklet'
      runOnJS(applyKeyboardHeight)(event.height, event.duration, true)
    },
    onMove: (event) => {
      'worklet'
      runOnJS(applyKeyboardHeight)(event.height, event.duration, false)
    },
    onInteractive: (event) => {
      'worklet'
      runOnJS(applyKeyboardHeight)(event.height, event.duration, false)
    },
    onEnd: (event) => {
      'worklet'
      runOnJS(applyKeyboardHeight)(event.height, event.duration, false)
    }
  }, [])

  return (
    <EditorKeyboardAvoidingContent
      {...props}
      keyboard_height={keyboard_event_height}
    />
  )
}
