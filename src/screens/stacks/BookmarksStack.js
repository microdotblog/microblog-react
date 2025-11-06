import * as React from 'react';
import { observer } from 'mobx-react';
import { Platform, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookmarksScreen from '../bookmarks/bookmarks';
import ProfileImage from './../../components/header/profile_image';
import AddBookmarkButton from '../../components/header/add_bookmark';
import BookmarkScreen from '../bookmarks/bookmark';
import NewPostButton from '../../components/header/new_post';
import { getSharedScreens } from './SharedStack'
import TagsButton from '../../components/header/tags_button';
import BackButton from '../../components/header/back';
import App from '../../stores/App'

const BookmarksStack = createNativeStackNavigator();

@observer
export default class Bookmarks extends React.Component{

  render() {
    const sharedScreens = getSharedScreens(BookmarksStack, "Bookmarks")
    return(
      <BookmarksStack.Navigator
        screenOptions={{
          headerTintColor: App.theme_text_color(),
          headerBackVisible: false,
          headerStatusBarHeight: Platform.OS === 'android' ? 0 : undefined
        }}
      >
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
            )
          }}
        />
        <BookmarksStack.Group
          screenOptions={({ }) => ({
            headerLeft: () => <BackButton />,
            headerBackTitleVisible: false
          })}
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
