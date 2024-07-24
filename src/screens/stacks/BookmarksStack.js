import * as React from 'react';
import { View } from 'react-native';
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
import RefreshActivity from '../../components/header/refresh_activity';
import FollowingScreen from '../../screens/following/following';
import UploadsScreen from '../../screens/uploads/uploads';
import NewUploadButton from '../../components/header/new_upload'
import RepliesScreen from '../replies/replies';
import PagesScreen from '../pages/pages';
import PostsScreen from '../posts/posts';

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
          <BookmarksStack.Screen
            name="Following"
            component={FollowingScreen}
            options={({ route }) => ({
              headerTitle: `Following`,
              headerRight: () => <NewPostButton />
            })}
          />
          <BookmarksStack.Screen
            name="Uploads"
            component={UploadsScreen}
            options={({ route }) => ({
              headerTitle: `Uploads`,
              headerRight: () => {
                return (
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <RefreshActivity type="uploads" />
                    <NewUploadButton />
                  </View>
                )
              }
            })}
          />
          <BookmarksStack.Screen
            name="Replies"
            component={RepliesScreen}
            options={({ route }) => ({
              headerTitle: "Replies",
              headerRight: () => <RefreshActivity type="replies" />
            })}
          />
          <BookmarksStack.Screen
            name="Pages"
            component={PagesScreen}
            options={({ route }) => ({
              headerTitle: "Pages",
              headerRight: () => <RefreshActivity type="pages" />
            })}
          />
          <BookmarksStack.Screen
            name="Posts"
            component={PostsScreen}
            options={({ route }) => ({
              headerTitle: "Posts",
              headerRight: () => <RefreshActivity type="posts" />
            })}
          />
        </BookmarksStack.Group>
      </BookmarksStack.Navigator>
    )
  }

}
