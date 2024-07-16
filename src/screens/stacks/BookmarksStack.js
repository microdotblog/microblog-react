import * as React from 'react';
import { observer } from 'mobx-react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookmarksScreen from '../bookmarks/bookmarks';
import ProfileImage from './../../components/header/profile_image';
import ProfileScreen from '../../screens/profile/profile';

const BookmarksStack = createNativeStackNavigator();

@observer
export default class Bookmarks extends React.Component{

  render() {
    return(
      <BookmarksStack.Navigator>
        <BookmarksStack.Screen
          name="Bookmarks"
          component={BookmarksScreen}
          options={{
            headerLeft: () => <ProfileImage />
          }}
        />
        <BookmarksStack.Group
          screenOptions={{
            headerBackTitleVisible: false
          }}
        >
          <BookmarksStack.Screen
            name="Profile"
            component={ProfileScreen}
            options={({ route }) => ({
              headerTitle: `@${route.params?.username}`,
              headerRight: () => <NewPostButton />
            })}
          />
        </BookmarksStack.Group>
      </BookmarksStack.Navigator>
    )
  }

}
