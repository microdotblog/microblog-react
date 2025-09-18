import * as React from 'react';
import { observer } from 'mobx-react';
import { View, TextInput, InputAccessoryView } from 'react-native';
import Auth from '../../stores/Auth';
import App from '../../stores/App'
import PostToolbar from '../../components/keyboard/post_toolbar'
import HighlightingText from '../../components/text/highlighting_text';
import LoadingComponent from '../../components/generic/loading';

@observer
export default class PostEditScreen extends React.Component{
  
  constructor(props) {
    super(props)
    this.input_accessory_view_id = "input_toolbar";
  }
  
  render() {
    const { posting } = Auth.selected_user
    return(
      <View style={{ flex: 1, backgroundColor: App.theme_background_color() }}>
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
            inputAccessoryViewID={this.input_accessory_view_id}
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
          selection={posting.text_selection_flat}
          onChangeText={({ nativeEvent: { text } }) => {
            !posting.is_sending_post ? posting.set_post_text_from_typing(text) : null
          }}
          onSelectionChange={({ nativeEvent: { selection } }) => {
            posting.set_text_selection(selection)
          }}
          inputAccessoryViewID={this.input_accessory_view_id}
        />
        <InputAccessoryView nativeID={this.input_accessory_view_id}>
          <PostToolbar componentId={this.props.componentId} is_post_edit />
        </InputAccessoryView>
        <LoadingComponent should_show={posting.is_sending_post && (posting.post_text != "")} />
      </View>
    )
  }
  
}
