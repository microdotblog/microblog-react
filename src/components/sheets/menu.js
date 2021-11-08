import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text } from 'react-native';
import Auth from './../../stores/Auth';
import { loginScreen } from './../../screens/';
import AccountSwitcher from '../menu/account_switcher'

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
        <AccountSwitcher />
      </View>
    )
  }
  
}