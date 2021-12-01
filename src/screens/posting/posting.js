import * as React from 'react';
import { observer } from 'mobx-react';
import { View, TextInput, Keyboard } from 'react-native';
import { Navigation } from 'react-native-navigation';

@observer
export default class PostingScreen extends React.Component{
  
  constructor(props) {
		super(props);
		Navigation.events().bindComponent(this);
	}
  
  navigationButtonPressed = ({ buttonId }) => {
    console.log("navigationButtonPressed::", buttonId)
    this._dismiss()
  }
  
  _dismiss = () => {
    Keyboard.dismiss()
		Navigation.dismissModal(this.props.componentId)
	}
  
  render() {
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
        />
      </View>
    )
  }
  
}