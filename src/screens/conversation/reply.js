import * as React from 'react';
import { observer } from 'mobx-react';
import { View, TextInput, Keyboard, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { Navigation } from 'react-native-navigation';
import Auth from '../../stores/Auth';
import Reply from '../../stores/Reply'

@observer
export default class ReplyScreen extends React.Component{
  
	constructor (props) {
		super(props)
		Navigation.events().bindComponent(this)
		this._text_selection = { start: 0, end: 0 }
	}
  
  navigationButtonPressed = async ({ buttonId }) => {
		console.log("navigationButtonPressed::", buttonId)
		this._dismiss()
    // if(buttonId === "post_button"){
    //   const sent = await Auth.selected_user.posting.send_post()
    //   if(sent){
    //     this._dismiss()
    //   }
    // }
    // else{
    //   this._dismiss()
    // }
  }
  
  _dismiss = () => {
    Keyboard.dismiss()
		Navigation.dismissModal(this.props.componentId)
	}
  
  render() {
    return(
      <View style={{ flex: 1 }}>
        <TextInput
          placeholderTextColor="lightgrey"
          style={{
            fontSize: 18,
            justifyContent: 'flex-start',
						alignItems: 'flex-start',
            marginBottom: 38,
            padding: 8,
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
            this._text_selection = selection
          }}
        />
        <View
          style={{
            width: '100%',
            backgroundColor: '#E5E7EB',
            position: 'absolute',
            bottom: 0,
            right: 0,
            left: 0,
            padding: 5,
            minHeight: 40,
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <TouchableOpacity style={{minWidth: 35}} onPress={() => Reply.handle_text_action("**", this._text_selection)}>
            <Text style={{ fontSize: 20, fontWeight: '700', textAlign: 'center', padding: 2 }}>{"**"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{minWidth: 35}} onPress={() => Reply.handle_text_action("_", this._text_selection)}>
            <Text style={{ fontSize: 20, fontWeight: '800', textAlign: 'center', padding: 2 }}>{"_"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{minWidth: 35}} onPress={() => Reply.handle_text_action("[]", this._text_selection)}>
            <Text style={{ fontSize: 20, fontWeight: '600', textAlign: 'center', padding: 2 }}>{"[ ]"}</Text>
          </TouchableOpacity>
          <View
            style={{
              position: 'absolute',
              right: 8,
              bottom: 9,
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Text
              style={{
                fontWeight: '200',
                padding: 2,
                backgroundColor: 'rgba(255,255,255,.6)'
              }}
            ><Text style={{ color: Reply.reply_text_length() > 280 ? '#a94442' : 'black' }}>{Reply.reply_text_length()}</Text>/280</Text>
          </View>
        </View>
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
              backgroundColor: 'rgba(255,255,255,0.6)',
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