import * as React from 'react';
import { observer } from 'mobx-react';
import { TextInput, View } from 'react-native';
import { KeyboardStickyView } from "react-native-keyboard-controller";
import Auth from '../../stores/Auth';
import App from '../../stores/App';
import EditorKeyboardAvoidingView from '../../components/keyboard/editor_keyboard_avoiding_view';
import PostToolbar from '../../components/keyboard/post_toolbar';
import AssetToolbar from '../../components/keyboard/asset_toolbar';
import UsernameToolbar from '../../components/keyboard/username_toolbar';
import HighlightingText from '../../components/text/highlighting_text';
import LoadingComponent from '../../components/generic/loading';

@observer
export default class PostingScreen extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      editor_is_visible: false
    }
    this.text_editor_ref = React.createRef()
    this.show_editor_timeout = null
  }

  componentDidMount() {
    Auth.selected_user?.prep_posting()
    this.show_editor_timeout = setTimeout(() => {
      this.setState({
        editor_is_visible: true
      }, () => {
        requestAnimationFrame(() => {
          this.text_editor_ref.current?.focus({ cursorToEnd: true })
        })
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
    const is_editor_enabled = !posting.is_sending_post && !posting.is_closing_after_post
    return(
      <View style={{ flex: 1 }}>
        <EditorKeyboardAvoidingView
          pointerEvents={this.state.editor_is_visible ? 'auto' : 'none'}
          style={[
            { flex: 1 },
            !this.state.editor_is_visible ? { opacity: 0 } : null
          ]}
        >
          {
            posting.should_show_title() ?
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
              editable={is_editor_enabled}
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
              onChangeText={(text) => is_editor_enabled ? posting.set_post_title(text) : null}
            />
            : null
          }
          <HighlightingText
            ref={this.text_editor_ref}
            placeholderTextColor="lightgrey"
            style={{
              minHeight: 300,
              fontSize: 18,
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              marginTop: 0,
              paddingBottom: posting.post_assets?.length > 0 ? 260 : 50,
              flex: 1,
              padding: 13,
              color: App.theme_text_color()
            }}
            editable={is_editor_enabled}
            multiline={true}
            scrollEnabled={true}
            returnKeyType={'default'}
            keyboardType={'default'}
            autoCorrect={true}
            clearButtonMode={'while-editing'}
            enablesReturnKeyAutomatically={true}
            underlineColorAndroid={'transparent'}
            value={posting.post_text}
            selection={posting.text_selection_flat}
            onChangeText={({ nativeEvent: { text } }) => {
              is_editor_enabled ? posting.set_post_text_from_typing(text) : null
            }}
            onSelectionChange={({ nativeEvent: { selection } }) => {
              posting.set_text_selection(selection)
            }}
          />
          <LoadingComponent should_show={posting.is_sending_post && posting.post_text != ""} />
        </EditorKeyboardAvoidingView>
        <KeyboardStickyView>
          <AssetToolbar componentId={this.props.componentId} />
          <UsernameToolbar componentId={this.props.componentId} object={posting} />
          <PostToolbar componentId={this.props.componentId} />
        </KeyboardStickyView>
      </View>
    )
  }
  
}
