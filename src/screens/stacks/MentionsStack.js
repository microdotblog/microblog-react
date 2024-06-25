import * as React from 'react';
import { observer } from 'mobx-react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MentionsScreen from '../mentions/mentions';
import LoginScreen from '../login/login';

const Stack = createNativeStackNavigator();

@observer
export default class MentionsStack extends React.Component{

  render() {
    return(
      <Stack.Navigator>
        <Stack.Screen name="Mentions" component={MentionsScreen} />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: 'Sign in',
          }}
        />
      </Stack.Navigator>
    )
  }

}
