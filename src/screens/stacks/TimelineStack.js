import * as React from 'react';
import { View } from 'react-native';
import { observer } from 'mobx-react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TimelineScreen from '../timeline/timeline';
import ProfileImage from './../../components/header/profile_image';
import NewPostButton from '../../components/header/new_post';
import ProfileScreen from '../../screens/profile/profile';
import ConversationScreen from '../../screens/conversation/conversation';
import ReplyButton from '../../components/header/reply';
import FollowingScreen from '../../screens/following/following';
import UploadsScreen from '../../screens/uploads/uploads';
import RefreshActivity from '../../components/header/refresh_activity'
import NewUploadButton from '../../components/header/new_upload'
import RepliesScreen from '../replies/replies';
import PagesScreen from '../pages/pages';
import PostsScreen from '../posts/posts';

const TimelineStack = createNativeStackNavigator();

@observer
export default class Timeline extends React.Component{

  render() {
    return(
      <TimelineStack.Navigator>
        <TimelineStack.Screen
          name="Timeline"
          component={TimelineScreen}
          options={{
            headerLeft: () => <ProfileImage />,
            headerRight: () => <NewPostButton />
          }}
        />
        <TimelineStack.Group
          screenOptions={{
            headerBackTitleVisible: false,
            headerTintColor: App.theme_text_color()
          }}
        >
          <TimelineStack.Screen
            name="Profile"
            component={ProfileScreen}
            options={({ route }) => ({
              headerTitle: `@${route.params?.username}`,
              headerRight: () => <NewPostButton />
            })}
          />
          <TimelineStack.Screen
            name="Conversation"
            component={ConversationScreen}
            options={({ route }) => ({
              headerTitle: `Conversation`,
              headerRight: () => <ReplyButton conversation_id={route.params?.conversation_id} />
            })}
          />
          <TimelineStack.Screen
            name="Following"
            component={FollowingScreen}
            options={({ route }) => ({
              headerTitle: `Following`,
              headerRight: () => <NewPostButton />
            })}
          />
          <TimelineStack.Screen
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
          <TimelineStack.Screen
            name="Replies"
            component={RepliesScreen}
            options={({ route }) => ({
              headerTitle: "Replies",
              headerRight: () => <RefreshActivity type="replies" />
            })}
          />
          <TimelineStack.Screen
            name="Pages"
            component={PagesScreen}
            options={({ route }) => ({
              headerTitle: "Pages",
              headerRight: () => <RefreshActivity type="pages" />
            })}
          />
          <TimelineStack.Screen
            name="Posts"
            component={PostsScreen}
            options={({ route }) => ({
              headerTitle: "Posts",
              headerRight: () => <RefreshActivity type="posts" />
            })}
          />
        </TimelineStack.Group>
      </TimelineStack.Navigator>
    )
  }

}
