import * as React from 'react';
import { observer } from 'mobx-react';
import { View, TextInput, Keyboard, ActivityIndicator, InputAccessoryView, Platform, KeyboardAvoidingView } from 'react-native';
import { Navigation } from 'react-native-navigation';
import ReplyToolbar from '../../components/keyboard/reply_toolbar'
import App from '../../stores/App'
import Auth from '../../stores/Auth'

@observer
export default class ReplyEditScreen extends React.Component{
  
  constructor (props) {
    super(props)
    Navigation.events().bindComponent(this)
    this.input_accessory_view_id = "input_toolbar";
  }
  
  navigationButtonPressed = async ({ buttonId }) => {
    console.log("ReplyEditScreen:navigationButtonPressed::", buttonId)
    if(buttonId === "post_button"){
      const sent = await Auth.selected_user.replies.selected_reply.update_reply()
      if(sent){
        this._dismiss()
      }
    }
    else{
      this._dismiss()
    }
  }
  
  _dismiss = () => {
    Keyboard.dismiss()
    Navigation.dismissModal(this.props.componentId)
  }
  
  render() {
    return(
      <KeyboardAvoidingView behavior={ Platform.OS === 'ios' ? 'padding' : undefined } style={{ flex: 1, backgroundColor: App.theme_background_color() }}>
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
            paddingBottom: Auth.selected_user.replies.selected_reply.reply_text_length() > 280 ? 90 : 0,
          }}
          editable={!Auth.selected_user.replies.selected_reply.is_sending_reply}
          multiline={true}
          scrollEnabled={true}
          returnKeyType={'default'}
          keyboardType={'default'}
          autoFocus={true}
          autoCorrect={true}
          clearButtonMode={'while-editing'}
          enablesReturnKeyAutomatically={true}
          underlineColorAndroid={'transparent'}
          value={Auth.selected_user.replies.selected_reply.reply_text}
          onChangeText={(text) => !Auth.selected_user.replies.selected_reply.is_sending_reply ? Auth.selected_user.replies.selected_reply.set_reply_text(text) : null}
          onSelectionChange={({ nativeEvent: { selection } }) => {
            Auth.selected_user.replies.selected_reply.set_text_selection(selection)
          }}
          inputAccessoryViewID={this.input_accessory_view_id}
        />
        {
          Platform.OS === 'ios' ?
            <InputAccessoryView nativeID={this.input_accessory_view_id}>
              <ReplyToolbar reply={Auth.selected_user.replies.selected_reply} />
            </InputAccessoryView>
          :  <ReplyToolbar reply={Auth.selected_user.replies.selected_reply} />
        }
        {
          Auth.selected_user.replies.selected_reply.is_sending_reply ?
          <View 
            style={{ 
              position: 'absolute',
              top: 0,
              bottom:0,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: App.theme_opacity_background_color(),
              zIndex: 10
            }} 
          >
            <ActivityIndicator color="#f80" size={'large'} />
          </View>
          : null
        }
      </KeyboardAvoidingView>
    )
  }
  
}