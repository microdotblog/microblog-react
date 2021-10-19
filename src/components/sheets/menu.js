import * as React from 'react';
import { observer } from 'mobx-react';
import { View } from 'react-native';
import Auth from './../../stores/Auth';
import DevInfo from './../dev/info';

@observer
export default class SheetMenu extends React.Component{
  
  render() {
    if(Auth.selected_user != null){
      return(
        <View
          style={{
            backgroundColor: 'white',
            height: 200,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 16,
          }}
        >
          <DevInfo />
        </View>
      )
    }
    return null
  }
  
}