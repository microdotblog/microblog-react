import * as React from 'react';
import { observer } from 'mobx-react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookmarksScreen from '../bookmarks/bookmarks';
import ProfileImage from './../../components/header/profile_image';
import AddBookmarkButton from '../../components/header/add_bookmark';
import BookmarkScreen from '../bookmarks/bookmark';
import NewPostButton from '../../components/header/new_post';
import { getSharedScreens } from './SharedStack'
import TagsButton from '../../components/header/tags_button';
import { View } from 'react-native';

const BookmarksStack = createNativeStackNavigator();

@observer
export default class Bookmarks extends React.Component{

  render() {
    const sharedScreens = getSharedScreens(BookmarksStack, "Bookmarks")
    return(
      <BookmarksStack.Navigator>
        <BookmarksStack.Screen
          name="Bookmarks"
          component={BookmarksScreen}
          options={{
            headerLeft: () => <ProfileImage />,
            headerRight: () => (
              <View style={{ justifyContent: 'center', alignItems: 'center', gap: 15, flexDirection: 'row' }}>
                <TagsButton />
                <AddBookmarkButton />
              </View>
                
            ),
            headerTintColor: App.theme_text_color()
          }}
        />
        <BookmarksStack.Group
          screenOptions={{
            headerBackTitleVisible: false,
            headerTintColor: App.theme_text_color()
          }}
        >
          {sharedScreens}
          <BookmarksStack.Screen
            name="Bookmark"
            component={BookmarkScreen}
            options={({ }) => ({
              headerTitle: `Bookmark`,
              headerRight: () => <NewPostButton />
            })}
          />
        </BookmarksStack.Group>
      </BookmarksStack.Navigator>
    )
  }

}
