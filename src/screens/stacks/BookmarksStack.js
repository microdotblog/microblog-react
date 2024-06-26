import * as React from 'react';
import { observer } from 'mobx-react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookmarksScreen from '../bookmarks/bookmarks';
import ProfileImage from './../../components/header/profile_image';

const Stack = createNativeStackNavigator();

@observer
export default class BookmarksStack extends React.Component{

  render() {
    return(
      <Stack.Navigator>
        <Stack.Screen
          name="Bookmarks"
          component={BookmarksScreen}
          options={{
            headerLeft: () => <ProfileImage />
          }}
        />
      </Stack.Navigator>
    )
  }

}
