import * as React from 'react';
import { observer } from 'mobx-react';
import { View, TextInput } from 'react-native';
import { KeyboardAvoidingView, KeyboardStickyView } from "react-native-keyboard-controller";
import ReplyToolbar from '../../components/keyboard/reply_toolbar'
import App from '../../stores/App'
import Replies from '../../stores/Replies'
import LoadingComponent from '../../components/generic/loading';

@observer
export default class ReplyEditScreen extends React.Component{
  
  render() {
    return(
      <View style={{flex: 1, justifyContent: 'space-between'}}>
        <KeyboardAvoidingView behavior='height' keyboardVerticalOffset={125}>
          <TextInput
            placeholderTextColor="lightgrey"
            style={{
              fontSize: 18,
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              marginTop: 3,
              padding: 8,
              color: App.theme_text_color(),
              paddingBottom: Replies.selected_reply?.reply_text_length() > 0 ? 90 : 50,
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
          />
          <LoadingComponent should_show={Replies.selected_reply?.is_sending_reply} />
        </KeyboardAvoidingView>
        <KeyboardStickyView>
          <ReplyToolbar reply={Replies.selected_reply} />
        </KeyboardStickyView>
      </View>
    )
  }
  
}
