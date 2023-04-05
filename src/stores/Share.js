import { types, flow, onSnapshot, applySnapshot } from 'mobx-state-tree'
import { ShareMenuReactView } from "react-native-share-menu";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ShareApi, { LOGIN_ERROR, LOGIN_TOKEN_INVALID, LOGIN_INCORRECT } from "../api/ShareApi"
import Tokens from "./Tokens";
import ShareUser from "./models/share/ShareUser";

export default Share = types.model('Share', {
	is_loading: types.optional(types.boolean, false),
	share_type: types.optional(types.string, "text"),
	users: types.optional(types.array(ShareUser), []),
	selected_user: types.maybeNull(types.reference(ShareUser)),
	max_characters_allowed: types.optional(types.number, 300),
	enforce_max_characters: types.optional(types.boolean, false),
	theme: types.optional(types.string, "light"),
})
	.actions(self => ({

		hydrate: flow(function* () {
			console.log('Share:hydrate', self)
			self.trigger_loading()
			const store = yield AsyncStorage.getItem('Share')
			if (store) {
				applySnapshot(self, JSON.parse(store))
				self.is_loading = true
				self.share_type = "text"
			}
			const data = yield Tokens.hydrate(true)
			if(data?.tokens){
				console.log('Share:hydrate:tokens', data.tokens)
				data.tokens.forEach(async (data) => {
					await self.login_account(data)
				})
			}
			const share_data = yield ShareMenuReactView.data()
			console.log('Share:hydrate:data', share_data)
			if (share_data) {
				yield self.set_data(share_data)
			}
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

		set_data: flow(function* (data) {
			console.log('Share:set_data', data)
		}),
		
		login_account: flow(function* (account_with_token = null) {
			console.log("Share:login_account", account_with_token)
			if(account_with_token){
				const existing_user = self.users.find(u => u.username === account_with_token.username)
				if(existing_user){
					// TODO: UPDATE USER
					if (self.selected_user == null) {
						self.selected_user = existing_user
					}
				}
				else{
					const login = yield ShareApi.login_with_token(account_with_token.token)
					if(login !== LOGIN_ERROR && login !== LOGIN_INCORRECT && login !== LOGIN_TOKEN_INVALID){
						console.log("Share:login_account:login", login)
						const new_user = ShareUser.create(login)
						self.users.push(new_user)
						self.selected_user = new_user
					}
				}
			}
		}),

		select_user: flow(function* (user) {
			console.log("Share:select_user", user)
			self.selected_user = user
			user.fetch_data()
		})

	}))
	.views(self => ({
		theme_accent_color(){
			return "#f80"
		},
		is_logged_in(){
			return self.users.length && self.selected_user != null && self.selected_user.token() != null
		}
	}))
	.create()

onSnapshot(Share, snapshot => { AsyncStorage.setItem('Share', JSON.stringify(snapshot)), console.log("SNAPSHOT:::SHARE") });