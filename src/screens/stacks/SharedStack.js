import * as React from 'react';
import { View } from 'react-native';

import ProfileScreen from '../../screens/profile/profile'
import ConversationScreen from '../../screens/conversation/conversation';
import ReplyButton from '../../components/header/reply';
import FollowingScreen from '../../screens/following/following';
import UploadsScreen from '../../screens/uploads/uploads';
import RefreshActivity from '../../components/header/refresh_activity'
import NewUploadButton from '../../components/header/new_upload'
import RepliesScreen from '../replies/replies';
import PagesScreen from '../pages/pages';
import PostsScreen from '../posts/posts';
import NewPostButton from '../../components/header/new_post';
import App from '../../stores/App'

export const getSharedScreens = (Stack, tab_name) => {
	return [
		<Stack.Screen
			key={`${tab_name}-Profile`}
			name={`${tab_name}-Profile`}
			component={ProfileScreen}
			options={({ route }) => ({
				headerTitle: `@${route.params?.username}`,
				headerRight: () => <NewPostButton />
			})}
		/>,
		<Stack.Screen
			key={`${tab_name}-Conversation`}
			name={`${tab_name}-Conversation`}
			component={ConversationScreen}
			options={({ route }) => ({
				headerTitle: `Conversation`,
				headerRight: () => <ReplyButton conversation_id={route.params?.conversation_id} />
			})}
			listeners={() => ({
				focus: () => {
					App.set_conversation_screen_focused(true)
				},
				blur: () => {
					App.set_conversation_screen_focused(false)
				}
			})}
		/>,
		<Stack.Screen
			key={`${tab_name}-Following`}
			name={`${tab_name}-Following`}
			component={FollowingScreen}
			options={({ route }) => ({
				headerTitle: `Following`,
				headerRight: () => <NewPostButton />
			})}
		/>,
		<Stack.Screen
			key={`${tab_name}-Uploads`}
			name={`${tab_name}-Uploads`}
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
		/>,
		<Stack.Screen
			key={`${tab_name}-Replies`}
			name={`${tab_name}-Replies`}
			component={RepliesScreen}
			options={({ route }) => ({
				headerTitle: "Replies",
				headerRight: () => <RefreshActivity type="replies" />
			})}
		/>,
		<Stack.Screen
			key={`${tab_name}-Pages`}
			name={`${tab_name}-Pages`}
			component={PagesScreen}
			options={({ route }) => ({
				headerTitle: "Pages",
				headerRight: () => <RefreshActivity type="pages" />
			})}
		/>,
		<Stack.Screen
			key={`${tab_name}-Posts`}
			name={`${tab_name}-Posts`}
			component={PostsScreen}
			options={({ route }) => ({
				headerTitle: "Posts",
				headerRight: () => <RefreshActivity type="posts" />
			})}
		/>
	]
}
