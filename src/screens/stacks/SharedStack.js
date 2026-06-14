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
import Auth from '../../stores/Auth'
import App from '../../stores/App'
import Replies from '../../stores/Replies'
import { headerItemGroupStyle, headerRightElement } from '../../utils/navigation'
import { isLiquidGlass } from '../../utils/ui'

function newPostHeaderItem() {
	if (Auth.selected_user == null || !Auth.selected_user.posting?.posting_enabled()) {
		return null
	}

	return {
		type: 'button',
		label: 'New Post',
		icon: {
			type: 'sfSymbol',
			name: 'square.and.pencil'
		},
		identifier: 'new-post',
		tintColor: App.theme_text_color(),
		width: 28,
		onPress: () => App.navigate_to_screen("Posting")
	}
}

function newPostHeaderItems() {
	return [newPostHeaderItem()].filter(Boolean)
}

function refreshIsLoading(type, user = null) {
	const selected_service = Auth.selected_user?.posting?.selected_service
	switch (type) {
		case "posts":
			return !!(selected_service?.is_loading_posts || App.is_searching_posts)
		case "pages":
			return !!(selected_service?.is_loading_pages || App.is_searching_pages)
		case "uploads":
			return !!selected_service?.is_loading_uploads
		case "muting":
			return !!(user?.muting?.is_loading || user?.muting?.is_sending_mute || user?.muting?.is_sending_unmute)
		default:
			return !!Replies.is_loading
	}
}

function refreshHeaderItems(type, user = null) {
	if (!isLiquidGlass()) {
		return headerRightElement(
			() => <RefreshActivity type={type} user={user} />,
			{ hidesSharedBackground: true }
		)
	}

	return {
		unstable_headerRightItems: () => {
			if (!refreshIsLoading(type, user)) {
				return []
			}

			return [
				{
					type: 'custom',
					element: <RefreshActivity type={type} user={user} />,
					hidesSharedBackground: true
				}
			]
		}
	}
}

function uploadMenuHeaderItem() {
	if (Auth.selected_user == null || !Auth.selected_user.posting?.posting_enabled()) {
		return null
	}

	const { config } = Auth.selected_user.posting.selected_service

	return {
		type: 'menu',
		label: 'Upload',
		icon: {
			type: 'sfSymbol',
			name: 'icloud.and.arrow.up'
		},
		identifier: 'new-upload',
		tintColor: App.theme_text_color(),
		width: 28,
		menu: {
			items: [
				{
					type: 'action',
					label: 'Photo library',
					icon: {
						type: 'sfSymbol',
						name: 'photo'
					},
					onPress: () => {
						Auth.selected_user.posting.selected_service?.pick_image(config?.temporary_destination())
					}
				},
				{
					type: 'action',
					label: 'Files',
					icon: {
						type: 'sfSymbol',
						name: 'folder'
					},
					onPress: () => {
						Auth.selected_user.posting.selected_service?.pick_file(config?.temporary_destination())
					}
				}
			]
		}
	}
}

function uploadsHeaderItems() {
	const items = []
	if (refreshIsLoading("uploads")) {
		items.push({
			type: 'custom',
			element: <RefreshActivity type="uploads" />,
			hidesSharedBackground: true
		})
	}

	const upload_item = uploadMenuHeaderItem()
	if (upload_item != null) {
		items.push(upload_item)
	}

	return items
}

export const getSharedScreens = (Stack, tab_name) => {
	return [
		<Stack.Screen
			key={`${tab_name}-Profile`}
			name={`${tab_name}-Profile`}
			component={ProfileScreen}
			options={({ route }) => ({
				headerTitle: `@${route.params?.username}`,
				...(isLiquidGlass() ?
					{
						unstable_headerRightItems: newPostHeaderItems
					}
					:
					headerRightElement(() => <NewPostButton />)
				)
			})}
		/>,
		<Stack.Screen
			key={`${tab_name}-Conversation`}
			name={`${tab_name}-Conversation`}
			component={ConversationScreen}
			options={({ route }) => ({
				headerTitle: `Conversation`,
				...(isLiquidGlass() ?
					{
						unstable_headerRightItems: () => [
							{
								type: 'button',
								label: 'Reply',
								icon: {
									type: 'sfSymbol',
									name: 'arrowshape.turn.up.left.fill'
								},
								identifier: 'conversation-reply',
								tintColor: App.theme_text_color(),
								width: 28,
								onPress: () => {
									if (route.params?.conversation_id != null) {
										App.open_sheet("reply_sheet", { conversation_id: route.params.conversation_id })
									}
								}
							}
						]
					}
					:
					headerRightElement(() => <ReplyButton conversation_id={route.params?.conversation_id} />)
				)
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
					...(isLiquidGlass() ?
						{
							unstable_headerRightItems: newPostHeaderItems
						}
						:
					headerRightElement(() => <NewPostButton />)
				)
			})}
		/>,
		<Stack.Screen
			key={`${tab_name}-Uploads`}
			name={`${tab_name}-Uploads`}
			component={UploadsScreen}
			options={({ route }) => ({
				headerTitle: `Uploads`,
				...(isLiquidGlass() ?
					{
						unstable_headerRightItems: uploadsHeaderItems
					}
					:
					headerRightElement(() => {
						return (
							<View style={headerItemGroupStyle(10)}>
								<RefreshActivity type="uploads" />
								<NewUploadButton />
							</View>
						)
					})
				)
			})}
		/>,
		<Stack.Screen
			key={`${tab_name}-Replies`}
			name={`${tab_name}-Replies`}
			component={RepliesScreen}
			options={({ route }) => ({
				headerTitle: "Replies",
				...refreshHeaderItems("replies")
			})}
		/>,
		<Stack.Screen
			key={`${tab_name}-Pages`}
			name={`${tab_name}-Pages`}
			component={PagesScreen}
			options={({ route }) => ({
				headerTitle: "Pages",
				...refreshHeaderItems("pages")
			})}
		/>,
		<Stack.Screen
			key={`${tab_name}-Posts`}
			name={`${tab_name}-Posts`}
			component={PostsScreen}
			options={({ route }) => ({
				headerTitle: "Posts",
				...refreshHeaderItems("posts")
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
				...refreshHeaderItems("muting", route.params?.user)
			})}
		/>,
	]
}
