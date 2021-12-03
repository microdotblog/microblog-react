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
          editable={!posting.is_sending_post}
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
          onChangeText={(text) => !posting.is_sending_post ? posting.set_post_text(text) : null}
        />
        {
          posting.is_sending_post ?
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