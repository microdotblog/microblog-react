import * as React from 'react'
import { observer } from 'mobx-react'
import { Keyboard, Platform, StyleSheet, View } from 'react-native'
import { WebView } from 'react-native-webview'
import App from '../../stores/App'
import { EditorKeyboardFrameContext } from '../keyboard/editor_keyboard_avoiding_view'
import editorHtml from './editor_html'

@observer
export default class HighlightingText extends React.Component {
  static contextType = EditorKeyboardFrameContext

  constructor(props) {
    super(props)
    this.state = {
      container_height: 0,
      measured_editor_height: 0,
      keyboard_scroll_request: 0
    }
    this.container = React.createRef()
    this.webview = React.createRef()
    this.is_ready = false
    this.last_webview_text = this.normalizedValue(props)
    this.last_webview_selection = this.serializedSelection(props.selection)
    this.last_config = null
    this.keyboard_is_visible = false
    this.keyboard_show_listener = null
    this.keyboard_hide_listener = null
  }

  componentDidMount() {
    const show_event = Platform.OS === 'ios' ? 'keyboardWillChangeFrame' : 'keyboardDidShow'
    const hide_event = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    this.keyboard_show_listener = Keyboard.addListener(show_event, this.handleKeyboardChange)
    this.keyboard_hide_listener = Keyboard.addListener(hide_event, this.handleKeyboardHide)
  }

  componentDidUpdate(prevProps, prevState) {
    this.measureEditorHeight()

    if (!this.is_ready) {
      return
    }

    const value = this.normalizedValue(this.props)
    const previous_value = this.normalizedValue(prevProps)
    const selection = this.serializedSelection(this.props.selection)
    const previous_selection = this.serializedSelection(prevProps.selection)
    const config = this.editorConfig()
    const config_serialized = JSON.stringify(config)

    const value_changed_externally = value !== previous_value && value !== this.last_webview_text
    const selection_changed_externally = selection !== previous_selection && selection !== this.last_webview_selection
    const config_changed = config_serialized !== this.last_config
    const keyboard_scroll_requested = this.state.keyboard_scroll_request !== prevState.keyboard_scroll_request

    if (value_changed_externally || selection_changed_externally || config_changed || keyboard_scroll_requested) {
      this.syncEditor({
        include_value: value_changed_externally,
        include_selection: selection_changed_externally,
        focus: selection_changed_externally,
        scrollSelectionIntoView: keyboard_scroll_requested
      })
    }
  }

  componentWillUnmount() {
    this.keyboard_show_listener?.remove()
    this.keyboard_hide_listener?.remove()
  }

  normalizedValue(props = this.props) {
    return props.value || ''
  }

  flattenedStyle() {
    return StyleSheet.flatten(this.props.style) || {}
  }

  editorConfig() {
    const style = this.flattenedStyle()
    const padding = style.padding != null ? style.padding : 0

    return {
      editable: this.props.editable !== false,
      colorScheme: this.props.colorScheme || App.theme,
      backgroundColor: style.backgroundColor || App.theme_background_color(),
      textColor: style.color || App.theme_text_color(),
      placeholderTextColor: this.props.placeholderTextColor || App.theme_placeholder_text_color(),
      fontSize: style.fontSize || 18,
      paddingTop: style.paddingTop != null ? style.paddingTop : padding,
      paddingRight: style.paddingRight != null ? style.paddingRight : padding,
      paddingBottom: style.paddingBottom != null ? style.paddingBottom : padding,
      paddingLeft: style.paddingLeft != null ? style.paddingLeft : padding,
      bottomOverlayHeight: this.props.bottomOverlayHeight || 0,
      viewportHeight: this.editorHeight()
    }
  }

  editorHeight() {
    return this.state.measured_editor_height || this.state.container_height
  }

  webviewStyle() {
    const style = {
      ...this.flattenedStyle(),
      padding: 0,
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      backgroundColor: this.editorConfig().backgroundColor
    }

    delete style.color
    delete style.fontSize
    delete style.textAlignVertical
    delete style.justifyContent
    delete style.alignItems

    if (this.context?.keyboard_height > 0) {
      delete style.minHeight
    }

    const editor_height = this.editorHeight()
    if (editor_height > 0) {
      style.height = editor_height
      style.flex = 0
      delete style.minHeight
    }

    return style
  }

  serializedSelection(selection) {
    const parsed = this.parseSelection(selection)
    return `${parsed.start} ${parsed.end}`
  }

  parseSelection(selection) {
    if (selection == null || selection === '') {
      return {
        start: 0,
        end: 0
      }
    }

    if (typeof selection === 'string') {
      const pieces = selection.trim().split(/\s+/)
      const start = Number.parseInt(pieces[0], 10)
      const end = Number.parseInt(pieces[1], 10)
      return {
        start: Number.isFinite(start) ? start : 0,
        end: Number.isFinite(end) ? end : Number.isFinite(start) ? start : 0
      }
    }

    if (typeof selection === 'object') {
      const start = Number.parseInt(selection.start, 10)
      const end = Number.parseInt(selection.end, 10)
      return {
        start: Number.isFinite(start) ? start : 0,
        end: Number.isFinite(end) ? end : Number.isFinite(start) ? start : 0
      }
    }

    return {
      start: 0,
      end: 0
    }
  }

  injectJavaScript(script) {
    this.webview.current?.injectJavaScript(`${script}\ntrue;`)
  }

  requestScrollSelectionIntoView() {
    this.setState((state) => {
      return {
        keyboard_scroll_request: state.keyboard_scroll_request + 1
      }
    })
  }

  handleKeyboardChange = () => {
    this.keyboard_is_visible = true
    this.measureEditorHeight()
    this.requestScrollSelectionIntoView()
  }

  handleKeyboardHide = () => {
    this.keyboard_is_visible = false
  }

  handleLayout = (event) => {
    const height = event?.nativeEvent?.layout?.height || 0
    if (height > 0 && height !== this.state.container_height) {
      this.setState({
        container_height: height
      }, this.measureEditorHeight)
    }
    else {
      this.measureEditorHeight()
    }

    if (this.keyboard_is_visible) {
      this.requestScrollSelectionIntoView()
    }
  }

  measureEditorHeight = () => {
    if (this.context?.window_bottom <= 0) {
      return
    }

    this.container.current?.measureInWindow((x, y) => {
      const height = Math.max(0, this.context.window_bottom - y)
      if (height > 0 && height !== this.state.measured_editor_height) {
        this.setState({
          measured_editor_height: height
        })
      }
    })
  }

  measuredWebViewStyle() {
    const editor_height = this.editorHeight()

    if (editor_height <= 0) {
      return null
    }

    const style = {
      height: editor_height,
      flex: 0
    }

    return style
  }

  syncEditor(options = {}) {
    const config = this.editorConfig()
    const payload = {
      ...config,
      focus: options.focus || (options.initial && this.props.autoFocus),
      cursorToEnd: !!(options.initial && this.props.autoFocus),
      scrollSelectionIntoView: !!options.scrollSelectionIntoView
    }

    if (options.include_value) {
      payload.value = this.normalizedValue()
      this.last_webview_text = payload.value
    }

    if (options.include_selection) {
      payload.selection = this.parseSelection(this.props.selection)
      this.last_webview_selection = this.serializedSelection(this.props.selection)
    }

    this.last_config = JSON.stringify(config)
    this.injectJavaScript(`window.MicroBlogReactEditor.updateFromReact(${JSON.stringify(payload)})`)
  }

  handleMessage = (event) => {
    let message = null
    try {
      message = JSON.parse(event.nativeEvent.data)
    }
    catch (error) {
      console.log('HighlightingText:message:error', error)
      return
    }

    if (message.type === 'ready') {
      this.is_ready = true
      this.syncEditor({
        include_value: true,
        include_selection: true,
        initial: true
      })
      return
    }

    if (message.type === 'change') {
      const text = message.payload?.text || ''
      this.last_webview_text = text
      if (message.payload?.selection) {
        this.last_webview_selection = this.serializedSelection(message.payload.selection)
      }
      this.props.onChangeText?.({
        nativeEvent: {
          text
        }
      })
      return
    }

    if (message.type === 'selection') {
      const selection = message.payload || {
        start: 0,
        end: 0
      }
      this.last_webview_selection = this.serializedSelection(selection)
      this.props.onSelectionChange?.({
        nativeEvent: {
          selection
        }
      })
    }
  }

  shouldStartLoad = (request) => {
    const url = request.url || ''
    return url === 'about:blank' || url.startsWith('https://micro.blog')
  }

  render() {
    const config = this.editorConfig()

    return (
      <View ref={this.container} onLayout={this.handleLayout} style={this.webviewStyle()}>
        <WebView
          ref={this.webview}
          source={{ html: editorHtml, baseUrl: 'https://micro.blog' }}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={false}
          scrollEnabled={this.props.scrollEnabled !== false}
          hideKeyboardAccessoryView={true}
          keyboardDisplayRequiresUserAction={false}
          setSupportMultipleWindows={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          onMessage={this.handleMessage}
          onShouldStartLoadWithRequest={this.shouldStartLoad}
          automaticallyAdjustContentInsets={false}
          bounces={false}
          contentInsetAdjustmentBehavior="never"
          style={[styles.webview, this.measuredWebViewStyle(), { backgroundColor: config.backgroundColor }]}
          containerStyle={{ backgroundColor: config.backgroundColor }}
          overScrollMode={Platform.OS === 'android' ? 'never' : undefined}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  webview: {
    flex: 1
  }
})
