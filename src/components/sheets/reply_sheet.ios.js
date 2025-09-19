import * as React from 'react'
import { observer } from 'mobx-react'
import { View, TextInput, InputAccessoryView, Platform, TouchableOpacity, Text } from 'react-native'
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import ActionSheet from 'react-native-actions-sheet'
import Reply from '../../stores/Reply'
import ReplyToolbar from '../keyboard/reply_toolbar'
import App from '../../stores/App'
import { SFSymbol } from 'react-native-sfsymbols'
import LoadingComponent from '../generic/loading';

@observer
export default class ReplySheet extends React.Component {
  constructor(props) {
    super(props)
    this.input_accessory_view_id = 'input_toolbar'
  }

  handleClose = () => {
    App.close_sheet('reply_sheet')
  }

  handleSend = async () => {
    let sent = await Reply.send_reply()
    if (sent) {
      App.close_sheet('reply_sheet')
    }
  }

  render() {
    return (
      <ActionSheet
        id={this.props.sheetId}
        useBottomSafeAreaPadding={true}
        gestureEnabled={true}
        containerStyle={{ backgroundColor: App.theme_modal_background_color(), padding: 0 }}
        snapPoints={[45, 95]}
        initialSnapIndex={[1]}
        backgroundInteractionEnabled={true}
        isModal={true}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: 1, borderColor: App.theme_border_color(), backgroundColor: App.theme_modal_background_color() }}>
          <TouchableOpacity
            onPress={this.handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <SFSymbol name={'xmark'} color={App.theme_text_color()} style={{ height: 20, width: 20 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={this.handleSend} disabled={Reply.is_sending_reply || !Reply.replying_enabled()} style={{ opacity: Reply.is_sending_reply || !Reply.replying_enabled() ? 0.5 : 1 }}>
            <Text style={{ color: App.theme_accent_color(), fontWeight: '700', fontSize: 16 }}>Send</Text>
          </TouchableOpacity>
        </View>
        <View>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ backgroundColor: App.theme_modal_background_color() }}
          >
            <TextInput
              placeholderTextColor="lightgrey"
              style={{
                minHeight: 120,
                maxHeight: 240,
                textAlignVertical: 'top',
                fontSize: 18,
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                marginTop: 3,
                marginBottom: 38,
                padding: 8,
                color: App.theme_text_color(),
                paddingBottom: Reply.reply_text_length() > 0 ? 35 : 0
              }}
              editable={!Reply.is_sending_reply}
              multiline={true}
              scrollEnabled={true}
              returnKeyType={'default'}
              keyboardType={'default'}
              autoFocus={true}
              autoCorrect={true}
              clearButtonMode={'while-editing'}
              enablesReturnKeyAutomatically={true}
              underlineColorAndroid={'transparent'}
              value={Reply.reply_text}
              onChangeText={text => !Reply.is_sending_reply ? Reply.set_reply_text_from_typing(text) : null}
              onSelectionChange={({ nativeEvent: { selection } }) => {
                Reply.set_text_selection(selection)
              }}
              inputAccessoryViewID={this.input_accessory_view_id}
            />
            <InputAccessoryView nativeID={this.input_accessory_view_id}>
              <ReplyToolbar reply={Reply} />
            </InputAccessoryView>
            <LoadingComponent should_show={Reply.is_sending_reply} />
            <LoadingComponent should_show={Reply.is_loading_conversation} message="Loading conversation..." />
          </KeyboardAvoidingView>
        </View>
      </ActionSheet>
    )
  }
}
