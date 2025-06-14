import * as React from 'react'
import { observer } from 'mobx-react'
import { View, TextInput, ActivityIndicator, InputAccessoryView, Platform, KeyboardAvoidingView, TouchableOpacity, Text } from 'react-native'
import ActionSheet from 'react-native-actions-sheet'
import Reply from '../../stores/Reply'
import ReplyToolbar from '../keyboard/reply_toolbar'
import App from '../../stores/App'
import { SFSymbol } from 'react-native-sfsymbols'
import { SvgXml } from 'react-native-svg'

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
        backgroundInteractionEnabled={true}
        isModal={true}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderColor: App.theme_border_color(), backgroundColor: App.theme_modal_background_color() }}>
          <TouchableOpacity onPress={this.handleClose}>
            {Platform.OS === 'ios' ? (
              <SFSymbol name={'xmark'} color={App.theme_text_color()} style={{ height: 22, width: 22 }} />
            ) : (
              <SvgXml
                style={{ height: 24, width: 24, marginRight: 7, marginTop: 2 }}
                color={App.theme_text_color()}
                xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>'
              />
            )}
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
                paddingBottom: Reply.reply_text_length() > 280 ? 90 : 0
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
            {Platform.OS === 'ios' ? (
              <InputAccessoryView nativeID={this.input_accessory_view_id}>
                <ReplyToolbar reply={Reply} />
              </InputAccessoryView>
            ) : (
              <>
                <ReplyToolbar reply={Reply} />
              </>
            )}
            {Reply.is_sending_reply ? (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  height: 200,
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 10
                }}
              >
                <ActivityIndicator color="#f80" size={'large'} />
              </View>
            ) : null}
            {Reply.is_loading_conversation ? (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: 200,
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 20,
                  backgroundColor: App.theme_modal_background_color(),
                  opacity: 0.95
                }}
              >
                <ActivityIndicator color="#f80" size={'large'} />
                <Text style={{ color: App.theme_text_color(), marginTop: 15, fontSize: 16 }}>Loading conversation...</Text>
              </View>
            ) : null}
          </KeyboardAvoidingView>
        </View>
      </ActionSheet>
    )
  }
} 