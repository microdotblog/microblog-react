import * as React from 'react';
import { observer } from 'mobx-react';
import { View, TextInput, Keyboard, ActivityIndicator, InputAccessoryView, Platform } from 'react-native';
import { Navigation } from 'react-native-navigation';
import Reply from '../../stores/Reply'
import ReplyToolbar from '../../components/keyboard/reply_toolbar'
import App from '../../stores/App'

@observer
export default class ReplyScreen extends React.Component{
  
	constructor (props) {
		super(props)
		Navigation.events().bindComponent(this)
		this.input_accessory_view_id = "input_toolbar";
	}
  
  navigationButtonPressed = async ({ buttonId }) => {
		console.log("ReplyScreen:navigationButtonPressed::", buttonId)
    if(buttonId === "post_button"){
      const sent = await Reply.send_reply()
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
      <View style={{ flex: 1, backgroundColor: App.theme_background_color() }}>
        <TextInput
          placeholderTextColor="lightgrey"
          style={{
            fontSize: 18,
            justifyContent: 'flex-start',
						alignItems: 'flex-start',
            marginBottom: 38,
            padding: 8,
            color: App.theme_text_color()
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
          onChangeText={(text) => !Reply.is_sending_reply ? Reply.set_reply_text(text) : null}
          onSelectionChange={({ nativeEvent: { selection } }) => {
            Reply.set_text_selection(selection)
          }}
          inputAccessoryViewID={this.input_accessory_view_id}
        />
        {
          Platform.OS === 'ios' ?
            <InputAccessoryView nativeID={this.input_accessory_view_id}>
              <ReplyToolbar />
            </InputAccessoryView>
          :  <ReplyToolbar />
        }
        {
          Reply.is_sending_reply ?
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
      </View>
    )
  }
  
}