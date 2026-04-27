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
import MutingScreen from '../settings/muting';
import CollectionsScreen from '../uploads/collections'
import NewPostButton from '../../components/header/new_post';
import NewCollectionButton from '../../components/header/new_collection';
import App from '../../stores/App'
import { headerRightElement } from '../../utils/navigation'

export const getSharedScreens = (Stack, tab_name) => {
	return [
		<Stack.Screen
			key={`${tab_name}-Profile`}
			name={`${tab_name}-Profile`}
			component={ProfileScreen}
			options={({ route }) => ({
				headerTitle: `@${route.params?.username}`,
				...headerRightElement(() => <NewPostButton />)
			})}
		/>,
		<Stack.Screen
			key={`${tab_name}-Conversation`}
			name={`${tab_name}-Conversation`}
			component={ConversationScreen}
			options={({ route }) => ({
				headerTitle: `Conversation`,
				...headerRightElement(() => <ReplyButton conversation_id={route.params?.conversation_id} />)
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
				...headerRightElement(() => <NewPostButton />)
			})}
		/>,
		<Stack.Screen
			key={`${tab_name}-Uploads`}
			name={`${tab_name}-Uploads`}
			component={UploadsScreen}
			options={({ route }) => ({
				headerTitle: `Uploads`,
				...headerRightElement(() => {
					return (
						<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
							<RefreshActivity type="uploads" />
							<NewUploadButton />
						</View>
					)
				})
			})}
		/>,
		<Stack.Screen
			key={`${tab_name}-Replies`}
			name={`${tab_name}-Replies`}
			component={RepliesScreen}
			options={({ route }) => ({
				headerTitle: "Replies",
				...headerRightElement(() => <RefreshActivity type="replies" />)
			})}
		/>,
		<Stack.Screen
			key={`${tab_name}-Pages`}
			name={`${tab_name}-Pages`}
			component={PagesScreen}
			options={({ route }) => ({
				headerTitle: "Pages",
				...headerRightElement(() => <RefreshActivity type="pages" />)
			})}
		/>,
		<Stack.Screen
			key={`${tab_name}-Posts`}
			name={`${tab_name}-Posts`}
			component={PostsScreen}
			options={({ route }) => ({
				headerTitle: "Posts",
				...headerRightElement(() => <RefreshActivity type="posts" />)
			})}
		/>,
		<Stack.Screen
			key={`${tab_name}-Collections`}
			name={`${tab_name}-Collections`}
			component={CollectionsScreen}
			options={({ route }) => ({
				headerTitle: "Collections",
				...headerRightElement(() => <NewCollectionButton />)
			})}
		/>,
		<Stack.Screen
			key={`${tab_name}-Muting`}
			name={`${tab_name}-Muting`}
			component={MutingScreen}
			options={({ route }) => ({
				headerTitle: "Muting",
				...headerRightElement(() => <RefreshActivity type="muting" />)
			})}
		/>,
	]
}
