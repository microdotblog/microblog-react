import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity } from 'react-native';
import { loginScreen } from './../../screens'
import Auth from './../../stores/Auth';

@observer
export default class DevInfo extends React.Component{
  
  render() {
    if(__DEV__ && Auth.selected_user != null){
      return(
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 15 }}>
          <Text>{Auth.selected_user?.username}</Text>
          <TouchableOpacity onPress={loginScreen}>
            <Text style={{ color: "orange" }}>Trigger login modal</Text>
          </TouchableOpacity>
        </View>
      )
    }
    return null
  }
  
}