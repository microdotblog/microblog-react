import * as React from 'react';
import { observer } from 'mobx-react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookmarksScreen from '../bookmarks/bookmarks';
import ProfileImage from './../../components/header/profile_image';
import AddBookmarkButton from '../../components/header/add_bookmark';
import HighlightsScreen from '../bookmarks/highlights';
import BookmarkScreen from '../bookmarks/bookmark';
import NewPostButton from '../../components/header/new_post';
import RefreshActivity from '../../components/header/refresh_activity';
import { getSharedScreens } from './SharedStack'

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
            headerRight: () => <AddBookmarkButton />,
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
            name="Highlights"
            component={HighlightsScreen}
            options={{
              headerTitle: "Highlights",
              headerRight: () => <RefreshActivity type="highlights" />
            }}
          />
          <BookmarksStack.Screen
            name="Bookmark"
            component={BookmarkScreen}
            options={({ route }) => ({
              headerTitle: `Bookmark`,
              headerRight: () => <NewPostButton />
            })}
          />
        </BookmarksStack.Group>
      </BookmarksStack.Navigator>
    )
  }

}
