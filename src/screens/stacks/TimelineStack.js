import * as React from 'react';
import { observer } from 'mobx-react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TimelineScreen from '../timeline/timeline';
import LoginScreen from '../login/login';

const Stack = createNativeStackNavigator();

@observer
export default class TimelineStack extends React.Component{

  render() {
    return(
      <Stack.Navigator>
        <Stack.Screen name="Timeline" component={TimelineScreen} />
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
