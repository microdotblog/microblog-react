import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity } from 'react-native';
import { loginScreen } from './../../screens'
import Auth from './../../stores/Auth';

@observer
export default class DevInfo extends React.Component{
  
  _render_accounts = () => {
    return Auth.users.map((user) => {
      return(
        <TouchableOpacity 
          key={user.username}
          onPress={() => Auth.select_user(user)}
        >
          <Text>{user.username}</Text>
        </TouchableOpacity>
      )
    })
  }
  
  render() {
    if(__DEV__ && Auth.selected_user != null){
      return(
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 15 }}>
          <Text>Current user: {Auth.selected_user?.username}</Text>
          <View style={{marginVertical: 15}}>
            <Text>Users:</Text>
            {this._render_accounts()}
          </View>
          <TouchableOpacity onPress={loginScreen}>
            <Text style={{ color: "orange" }}>Trigger login modal</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Auth.logout_user(Auth.selected_user)}>
            <Text style={{ color: "red" }}>Logout current user</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Auth.logout_all_user()}>
            <Text style={{ color: "pink" }}>Logout ALL</Text>
          </TouchableOpacity>
        </View>
      )
    }
    return null
  }
  
}