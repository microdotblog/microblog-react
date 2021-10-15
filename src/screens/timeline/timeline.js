import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text } from 'react-native';
import Auth from './../../stores/Auth';
import LoginMessage from './../../components/info/login_message';
import DevInfo from './../../components/dev/info';

@observer
export default class TimelineScreen extends React.Component{
  
  render() {
    return(
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {
          Auth.is_logged_in() ?
          <Text>Timeline</Text>
          :
          <LoginMessage title="Timeline" />
        }
        <DevInfo />
      </View>
    )
  }
  
}