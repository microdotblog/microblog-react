import * as React from 'react';
import { observer } from 'mobx-react';
import { TextInput, View } from 'react-native';
import { KeyboardStickyView } from "react-native-keyboard-controller";
import Auth from '../../stores/Auth';
import App from '../../stores/App'
import EditorKeyboardAvoidingView from '../../components/keyboard/editor_keyboard_avoiding_view'
import PostToolbar from '../../components/keyboard/post_toolbar'
import HighlightingText from '../../components/text/highlighting_text';
import LoadingComponent from '../../components/generic/loading';

@observer
export default class PageEditScreen extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      editor_is_visible: false
    }
    this.show_editor_timeout = null
  }

  componentDidMount() {
    this.show_editor_timeout = setTimeout(() => {
      this.setState({
        editor_is_visible: true
      })
    }, 1000)
  }

  componentWillUnmount() {
    if (this.show_editor_timeout) {
      clearTimeout(this.show_editor_timeout)
    }
  }
  
  render() {
    const { posting } = Auth.selected_user
    return(
      <View style={{ flex: 1 }}>
        <EditorKeyboardAvoidingView
          pointerEvents={this.state.editor_is_visible ? 'auto' : 'none'}
          style={[
            { flex: 1 },
            !this.state.editor_is_visible ? { opacity: 0 } : null
          ]}
        >
          <TextInput
            placeholder="Title"
            placeholderTextColor={App.theme_placeholder_text_color()}
            style={{
              fontSize: 18,
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              minHeight: 56,
              padding: 13,
              marginBottom: 4,
              fontWeight: '700',
              borderColor: App.theme_border_color(),
              borderBottomWidth: .5,
              color: App.theme_text_color()
            }}
            editable={!posting.is_sending_post}
            multiline={false}
            scrollEnabled={false}
            returnKeyType={'default'}
            keyboardType={'default'}
            autoFocus={false}
            autoCorrect={true}
            clearButtonMode={'while-editing'}
            enablesReturnKeyAutomatically={true}
            underlineColorAndroid={'transparent'}
            value={posting.post_title}
            onChangeText={(text) => !posting.is_sending_post ? posting.set_post_title(text) : null}
          />
          <HighlightingText
            placeholderTextColor="lightgrey"
            style={{
              minHeight: 300,
              fontSize: 18,
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              marginTop: 0,
              paddingBottom: posting.post_text_length() > posting.max_post_length() ? 150 : 0,
              flex: 1,
              padding: 13,
              color: App.theme_text_color()
            }}
            editable={!posting.is_sending_post}
            multiline={true}
            scrollEnabled={true}
            returnKeyType={'default'}
            keyboardType={'default'}
            autoFocus={true}
            autoCorrect={true}
            clearButtonMode={'while-editing'}
            enablesReturnKeyAutomatically={true}
            underlineColorAndroid={'transparent'}
            value={posting.post_text}
            selection={posting.text_selection_flat}
            onChangeText={({ nativeEvent: { text } }) => {
              !posting.is_sending_post ? posting.set_post_text_from_typing(text) : null
            }}
            onSelectionChange={({ nativeEvent: { selection } }) => {
              posting.set_text_selection(selection)
            }}
          />
          <LoadingComponent should_show={posting.is_sending_post && posting.post_text != ""} />
        </EditorKeyboardAvoidingView>
        <KeyboardStickyView>
          <PostToolbar componentId={this.props.componentId} is_post_edit hide_count hide_settings />
        </KeyboardStickyView>
      </View>
    )
  }
  
}
