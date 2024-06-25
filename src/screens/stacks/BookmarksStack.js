import * as React from 'react';
import { observer } from 'mobx-react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookmarksScreen from '../bookmarks/bookmarks';
import LoginScreen from '../login/login';

const Stack = createNativeStackNavigator();

@observer
export default class BookmarksStack extends React.Component{

  render() {
    return(
      <Stack.Navigator>
        <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
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
