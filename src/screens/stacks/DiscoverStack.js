import * as React from 'react';
import { View } from 'react-native';
import { observer } from 'mobx-react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DiscoverScreen from '../discover/discover';
import ProfileImage from './../../components/header/profile_image';
import NewPostButton from '../../components/header/new_post';
import ProfileScreen from '../../screens/profile/profile';
import DiscoverTopicScreen from '../../screens/discover/topic';
import ConversationScreen from '../../screens/conversation/conversation';
import ReplyButton from '../../components/header/reply';
import FollowingScreen from '../../screens/following/following';
import UploadsScreen from '../../screens/uploads/uploads';
import RefreshActivity from '../../components/header/refresh_activity'
import NewUploadButton from '../../components/header/new_upload'
import RepliesScreen from '../replies/replies';

const DiscoverStack = createNativeStackNavigator();

@observer
export default class Discover extends React.Component{

  render() {
    return(
      <DiscoverStack.Navigator>
        <DiscoverStack.Screen
          name="Discover"
          component={DiscoverScreen}
          options={{
            headerLeft: () => <ProfileImage />,
            headerRight: () => <NewPostButton />
          }}
        />
        <DiscoverStack.Group
          screenOptions={{
            headerBackTitleVisible: false,
            headerTintColor: App.theme_text_color()
          }}
        >
          <DiscoverStack.Screen
            name="Profile"
            component={ProfileScreen}
            options={({ route }) => ({
              headerTitle: `@${route.params?.username}`,
              headerRight: () => <NewPostButton />
            })}
          />
          <DiscoverStack.Screen
            name="DiscoverTopic"
            component={DiscoverTopicScreen}
            options={({ route }) => ({
              headerTitle: `${route.params?.topic.emoji} ${route.params?.topic.title}`,
              headerRight: () => <NewPostButton />
            })}
          />
          <DiscoverStack.Screen
            name="Conversation"
            component={ConversationScreen}
            options={({ route }) => ({
              headerTitle: `Conversation`,
              headerRight: () => <ReplyButton conversation_id={route.params?.conversation_id} />
            })}
          />
          <DiscoverStack.Screen
            name="Following"
            component={FollowingScreen}
            options={({ route }) => ({
              headerTitle: `Following`,
              headerRight: () => <NewPostButton />
            })}
          />
          <DiscoverStack.Screen
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
          <DiscoverStack.Screen
            name="Replies"
            component={RepliesScreen}
            options={({ route }) => ({
              headerTitle: "Replies",
              headerRight: () => <RefreshActivity type="replies" />
            })}
          />
        </DiscoverStack.Group>
      </DiscoverStack.Navigator>
    )
  }

}
