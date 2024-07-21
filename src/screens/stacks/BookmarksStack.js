import * as React from 'react';
import { observer } from 'mobx-react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookmarksScreen from '../bookmarks/bookmarks';
import ProfileImage from './../../components/header/profile_image';
import ProfileScreen from '../../screens/profile/profile';
import ConversationScreen from '../../screens/conversation/conversation';
import ReplyButton from '../../components/header/reply';
import AddBookmarkButton from '../../components/header/add_bookmark';
import HighlightsScreen from '../bookmarks/highlights';
import BookmarkScreen from '../bookmarks/bookmark';
import NewPostButton from '../../components/header/new_post';

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
            headerLeft: () => <ProfileImage />,
            headerRight: () => <AddBookmarkButton />
          }}
        />
        <BookmarksStack.Group
          screenOptions={{
            headerBackTitleVisible: false,
            headerTintColor: App.theme_text_color()
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
          <BookmarksStack.Screen
            name="Conversation"
            component={ConversationScreen}
            options={({ route }) => ({
              headerTitle: `Conversation`,
              headerRight: () => <ReplyButton conversation_id={route.params?.conversation_id} />
            })}
          />
          <BookmarksStack.Screen
            name="Highlights"
            component={HighlightsScreen}
            options={{
              headerTitle: "Highlights"
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
