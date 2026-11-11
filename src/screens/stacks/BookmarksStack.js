import * as React from 'react';
import { observer } from 'mobx-react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookmarksScreen from '../bookmarks/bookmarks';
import ProfileImage from './../../components/header/profile_image';
import { SidebarWidthContext } from '../../components/sidebar/sidebar_context'
import AddBookmarkButton from '../../components/header/add_bookmark';
import BookmarkScreen from '../bookmarks/bookmark';
import NewPostButton from '../../components/header/new_post';
import { getSharedScreens } from './SharedStack'
import TagsButton from '../../components/header/tags_button';
import BackButton from '../../components/header/back';
import App from '../../stores/App'
import { android_status_bar_options, headerItemGroupStyle, headerLeftElement, headerRightElement } from '../../utils/navigation'

const BookmarksStack = createNativeStackNavigator();

@observer
export default class Bookmarks extends React.Component{
  static contextType = SidebarWidthContext

  render() {
    const sharedScreens = getSharedScreens(BookmarksStack, "Bookmarks", this.context > 0)
    return(
      <BookmarksStack.Navigator
        screenOptions={{
          headerTintColor: App.theme_text_color(),
          headerBackVisible: false,
          ...android_status_bar_options()
        }}
      >
        <BookmarksStack.Screen
          name="Bookmarks"
          component={BookmarksScreen}
          options={({ route }) => ({
            ...(this.context > 0 ? {} : headerLeftElement(() => <ProfileImage routeKey={route.name} />)),
            ...headerRightElement(() => (
              <View style={headerItemGroupStyle(15)}>
                <TagsButton />
                <AddBookmarkButton />
              </View>
            ))
          })}
        />
        <BookmarksStack.Group
          screenOptions={({ }) => ({
            ...headerLeftElement(() => <BackButton />),
            headerBackTitleVisible: false
          })}
        >
          {sharedScreens}
          <BookmarksStack.Screen
            name="Bookmark"
            component={BookmarkScreen}
            options={({ }) => ({
              headerTitle: `Bookmark`,
              ...headerRightElement(() => <NewPostButton />)
            })}
          />
        </BookmarksStack.Group>
      </BookmarksStack.Navigator>
    )
  }

}
