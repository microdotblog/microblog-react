import * as React from 'react';
import { observer } from 'mobx-react';
import { TextInput } from 'react-native';
import { KeyboardStickyView } from "react-native-keyboard-controller";
import Auth from '../../stores/Auth';
import App from '../../stores/App'
import PostToolbar from '../../components/keyboard/post_toolbar'
import HighlightingText from '../../components/text/highlighting_text';
import LoadingComponent from '../../components/generic/loading';

@observer
export default class PostEditScreen extends React.Component{

  constructor(props) {
    super(props)
    this.state = {
      toolbar_height: 0,
    }
  }
  
  render() {
    const { posting } = Auth.selected_user
    return(
      <>
          {
            posting.should_show_title() ?
            <TextInput
              placeholder="Title"
              placeholderTextColor={App.theme_placeholder_text_color()}
              style={{
                fontSize: 18,
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                padding: 8,
                marginBottom: 0,
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
            : null
          }
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
              padding: 8,
              color: App.theme_text_color()
            }}
            editable={!posting.is_sending_post}
            multiline={true}
            scrollEnabled={true}
            returnKeyType={'default'}
            keyboardType={'default'}
            autoFocus={false}
            autoCorrect={true}
            clearButtonMode={'while-editing'}
            enablesReturnKeyAutomatically={true}
            underlineColorAndroid={'transparent'}
            value={posting.post_text}
            bottomOverlayHeight={this.state.toolbar_height}
            selection={posting.text_selection_flat}
            onChangeText={({ nativeEvent: { text } }) => {
              !posting.is_sending_post ? posting.set_post_text_from_typing(text) : null
            }}
            onSelectionChange={({ nativeEvent: { selection } }) => {
              posting.set_text_selection(selection)
            }}
          />
          <LoadingComponent should_show={posting.is_sending_post && (posting.post_text != "")} />
        <KeyboardStickyView onLayout={({ nativeEvent }) => {
          const toolbar_height = nativeEvent.layout.height
          if (toolbar_height !== this.state.toolbar_height) {
            this.setState({ toolbar_height })
          }
        }}>
          <PostToolbar componentId={this.props.componentId} is_post_edit />
        </KeyboardStickyView>
      </>
    )
  }
  
}
