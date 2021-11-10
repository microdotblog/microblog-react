import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity } from 'react-native';
import Auth from './../../stores/Auth';
import { loginScreen } from './../../screens/';
import AccountSwitcher from '../menu/account_switcher'
import MenuNavigation from '../menu/nav'

@observer
export default class SheetMenu extends React.Component{
  
  render() {
    return(
      <View
        style={{
          padding: 15,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 16
        }}
      >
        <MenuNavigation />
        {
          Auth.selected_user != null ?
            <AccountSwitcher />
            :
            <TouchableOpacity
              onPress={loginScreen}
              style={{
                padding: 8,
                paddingHorizontal: 16,
                backgroundColor: '#E5E7EB',
                borderRadius: 5,
              }}
            >
              <Text style={{ fontWeight: "700", color: "orange" }}>Please sign in to continue</Text>
            </TouchableOpacity>
        }
        
      </View>
    )
  }
  
}