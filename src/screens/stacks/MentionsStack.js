import * as React from 'react';
import { View } from 'react-native';
import { observer } from 'mobx-react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MentionsScreen from '../mentions/mentions';
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

const MentionsStack = createNativeStackNavigator();

@observer
export default class Mentions extends React.Component{

  render() {
    return(
      <MentionsStack.Navigator>
        <MentionsStack.Screen
          name="Mentions"
          component={MentionsScreen}
          options={{
            headerLeft: () => <ProfileImage />,
            headerRight: () => <NewPostButton />
          }}
        />
        <MentionsStack.Group
          screenOptions={{
            headerBackTitleVisible: false,
            headerTintColor: App.theme_text_color()
          }}
        >
          <MentionsStack.Screen
            name="Profile"
            component={ProfileScreen}
            options={({ route }) => ({
              headerTitle: `@${route.params?.username}`,
              headerRight: () => <NewPostButton />
            })}
          />
          <MentionsStack.Screen
            name="Conversation"
            component={ConversationScreen}
            options={({ route }) => ({
              headerTitle: `Conversation`,
              headerRight: () => <ReplyButton conversation_id={route.params?.conversation_id} />
            })}
          />
          <MentionsStack.Screen
            name="Following"
            component={FollowingScreen}
            options={({ route }) => ({
              headerTitle: `Following`,
              headerRight: () => <NewPostButton />
            })}
          />
          <MentionsStack.Screen
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
          <MentionsStack.Screen
            name="Replies"
            component={RepliesScreen}
            options={({ route }) => ({
              headerTitle: "Replies",
              headerRight: () => <RefreshActivity type="replies" />
            })}
          />
          <MentionsStack.Screen
            name="Pages"
            component={PagesScreen}
            options={({ route }) => ({
              headerTitle: "Pages",
              headerRight: () => <RefreshActivity type="pages" />
            })}
          />
        </MentionsStack.Group>
      </MentionsStack.Navigator>
    )
  }

}
