import * as React from 'react';
import { observer } from 'mobx-react';
import { TextInput, InputAccessoryView } from 'react-native';
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import ReplyToolbar from '../../components/keyboard/reply_toolbar'
import App from '../../stores/App'
import Replies from '../../stores/Replies'
import LoadingComponent from '../../components/generic/loading';

@observer
export default class ReplyEditScreen extends React.Component{
  
  constructor (props) {
    super(props)
    this.input_accessory_view_id = "input_toolbar";
  }
  
  render() {
    return(
      <KeyboardAvoidingView behavior='padding' style={{ flex: 1, backgroundColor: App.theme_background_color() }}>
        <TextInput
          placeholderTextColor="lightgrey"
          style={{
            fontSize: 18,
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            marginTop: 3,
            marginBottom: 38,
            padding: 8,
            color: App.theme_text_color(),
            paddingBottom: Replies.selected_reply?.reply_text_length() > 280 ? 90 : 0,
          }}
          editable={!Replies.selected_reply?.is_sending_reply}
          multiline={true}
          scrollEnabled={true}
          returnKeyType={'default'}
          keyboardType={'default'}
          autoFocus={true}
          autoCorrect={true}
          clearButtonMode={'while-editing'}
          enablesReturnKeyAutomatically={true}
          underlineColorAndroid={'transparent'}
          value={Replies.selected_reply?.reply_text}
          onChangeText={(text) => !Replies.selected_reply?.is_sending_reply ? Replies.selected_reply.set_reply_text(text) : null}
          onSelectionChange={({ nativeEvent: { selection } }) => {
            Replies.selected_reply?.set_text_selection(selection)
          }}
          inputAccessoryViewID={this.input_accessory_view_id}
        />
        <InputAccessoryView nativeID={this.input_accessory_view_id}>
          <ReplyToolbar reply={Replies.selected_reply} />
        </InputAccessoryView>
        <LoadingComponent should_show={Replies.selected_reply?.is_sending_reply} />
      </KeyboardAvoidingView>
    )
  }
  
}
