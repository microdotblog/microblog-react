import * as React from 'react';
import { observer } from 'mobx-react';
import { View, TextInput, Keyboard, ActivityIndicator } from 'react-native';
import { Navigation } from 'react-native-navigation';
import Auth from '../../stores/Auth';

@observer
export default class PostingScreen extends React.Component{
  
  constructor(props) {
		super(props);
		Navigation.events().bindComponent(this);
	}
  
  navigationButtonPressed = async ({ buttonId }) => {
    console.log("navigationButtonPressed::", buttonId)
    if(buttonId === "post_button"){
      const sent = await Auth.selected_user.posting.send_post()
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
    const { posting } = Auth.selected_user
    return(
      <View style={{ flex: 1, padding: 8 }}>
        <TextInput
          placeholderTextColor="lightgrey"
          style={{
            padding: 5,
            fontSize: 18,
            justifyContent: 'flex-start',
						alignItems: 'flex-start'
          }}
          multiline={true}
          scrollEnabled={true}
          returnKeyType={'default'}
					keyboardType={'default'}
					autoFocus={true}
					autoCorrect={true}
					clearButtonMode={'while-editing'}
					enablesReturnKeyAutomatically={true}
					underlineColorAndroid={'transparent'}
          value={posting.post_text}
          onChangeText={(text) => posting.set_post_text(text)}
        />
        {
          posting.is_sending_post ?
          <ActivityIndicator color="#f80" size={'large'} style={{ position: 'absolute', right: 5, bottom: 5 }}  />
          : null
        }
      </View>
    )
  }
  
}