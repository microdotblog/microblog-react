import { types, flow, applySnapshot } from 'mobx-state-tree'
import { ShareMenuReactView } from "react-native-share-menu";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MicroBlogApi, { LOGIN_ERROR, LOGIN_TOKEN_INVALID, LOGIN_INCORRECT } from "../api/MicroBlogApi"
import Tokens from "./Tokens";
import User from './models/User';
import string_checker from '../utils/string_checker'

export default Share = types.model('Share', {
	is_loading: types.optional(types.boolean, true),
	share_type: types.optional(types.string, "text"),
	share_data: types.optional(types.string, ""),
	users: types.optional(types.array(User), []),
	selected_user: types.maybeNull(types.reference(User)),
	toolbar_select_user_open: types.optional(types.boolean, false),
	toolbar_select_destination_open: types.optional(types.boolean, false)
})
	.actions(self => ({

		hydrate: flow(function* () {
			console.log('Share:hydrate', self)
			yield self.trigger_loading()
			yield App.prep_and_hydrate_share_extension()
			const store = yield AsyncStorage.getItem('Share')
			if (store) {
				applySnapshot(self, JSON.parse(store))
				self.is_loading = true
				self.share_type = "text"
				self.share_data = ""
			}
			const data = yield Tokens.hydrate(true)
			if (data?.tokens) {
				console.log('Share:hydrate:tokens', data.tokens)
				for (const user_data of data.tokens) {
					const existing_user = self.users.find(u => u.username === user_data.username)
					if (existing_user == null) {
						yield self.login_account(user_data)
					}
				}
			}
			yield self.set_data()
			self.trigger_loading(false)
		}),

		trigger_loading: flow(function* (is_loading = true) {
			console.log('Share:trigger_loading', is_loading)
			self.is_loading = is_loading
		}),

		open_in_app: flow(function* () {
			console.log('Share:open_in_app')
			ShareMenuReactView.continueInApp()
		}),

		set_data: flow(function* () {
			const share_data = yield ShareMenuReactView.data()
			console.log('Share:set_data', share_data)
			let data_array = share_data.data
			let data = data_array[ 0 ].data
			let mime_type = data_array[ 0 ].mimeType
			self.share_data = data
			console.log('Share:set_data:data', data, mime_type)
			if (self.selected_user) {
				if (mime_type === "image/jpeg" || mime_type === "image/png") {
					self.share_type = "image"
				}
				if (self.share_type === "text") {
					const text = data.startsWith("http://") || data.startsWith("https://") ? `[](${ data })` : `> ${ data }`
					Share.selected_user?.posting.set_post_text(text)
				}
				else if (self.share_type === "image") {
					const image_data = {
						uri: data,
						type: mime_type,
						mime: mime_type
					}
					Share.selected_user?.posting.create_and_attach_asset(image_data)
				}
				else {
					// TODO?: Not supported
				}
			}
		}),
		
		login_account: flow(function* (account_with_token = null) {
			console.log("Share:login_account")
			if (account_with_token) {
				const existing_user = self.users.find(u => u.username === account_with_token.username)
				if (existing_user) {
					console.log("Share:login_account:existing_user", existing_user, self.selected_user)
					// TODO: UPDATE USER
					if (self.selected_user == null || self.selected_user.username !== existing_user.username) {
						self.selected_user = existing_user
					}
				}
				else {
					const login = yield MicroBlogApi.login_with_token(account_with_token.token)
					if (login !== LOGIN_ERROR && login !== LOGIN_INCORRECT && login !== LOGIN_TOKEN_INVALID) {
						console.log("Share:login_account:login", login)
						const new_user = User.create(login)
						self.users.push(new_user)
						self.selected_user = new_user
					}
				}
			}
		}),

		select_user: flow(function* (user) {
			console.log("Share:select_user", user)
			if (self.selected_user !== user) {
				self.selected_user = user
				user.fetch_data()
			}
			else {
				self.selected_user?.fetch_data()
			}
			if (self.toolbar_select_user_open) {
				self.toolbar_select_user_open = false
			}
			yield self.set_data()
		}),

		toggle_select_user: flow(function* () {
			console.log("Share:toggle_select_user")
			self.toolbar_select_user_open = !self.toolbar_select_user_open
		}),

		toggle_select_destination: flow(function* () {
			console.log("Share:toggle_select_destination")
			self.toolbar_select_destination_open = !self.toolbar_select_destination_open
		}),

		save_as_bookmark: flow(function* () {
			console.log("Share:save_as_bookmark")
			const saved = yield self.selected_user.posting.add_bookmark(self.share_data)
			if (saved) {
				ShareMenuReactView.dismissExtension()
			}
			else {
				ShareMenuReactView.dismissExtension("Something went wrong. Please try again.")
			}
		}),

		send_post: flow(function* () {
			console.log("Share:send_post")
			const sent = yield self.selected_user.posting.send_post()
			if (sent) {
				ShareMenuReactView.dismissExtension()
			}
			else {
				ShareMenuReactView.dismissExtension("Something went wrong. Please try again.")
			}
		})

	}))
	.views(self => ({
		is_logged_in(){
			return self.users.length && self.selected_user != null && self.selected_user.token() != null
		},
		can_save_as_bookmark() {
			return self.share_type === "text" && self.share_data.length > 0 && (self.share_data.startsWith("http://") || self.share_data.startsWith("https://")) && string_checker._validate_url(self.share_data)
		},
		sorted_users() {
			return self.users.slice().sort((a, b) => {
				const a_is_selected = Share.selected_user?.username === a.username;
				const b_is_selected = Share.selected_user?.username === b.username;
				return b_is_selected - a_is_selected;
			})
		}
	}))
	.create()