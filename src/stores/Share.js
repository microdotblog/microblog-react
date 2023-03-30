import { types, flow, onSnapshot, applySnapshot } from 'mobx-state-tree'
import { ShareMenuReactView } from "react-native-share-menu";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import MicroBlogApi from '../api/MicroBlogApi'
// import MicroPubApi from '../api/MicroPubApi'
import Tokens from './Tokens';

export default Share = types.model('Share', {
	is_loading: types.optional(types.boolean, false),
	share_type: types.optional(types.string, "text")
})
	.actions(self => ({

		hydrate: flow(function* () {
			console.log('Share:hydrate', self)
			self.trigger_loading()
			const store = yield AsyncStorage.getItem('Share')
			if (store) {
				applySnapshot(self, JSON.parse(store))
				self.is_loading = false
				self.share_type = "text"
			}
			yield Tokens.hydrate()
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
		})

	}))
	.views(self => ({
		theme_accent_color(){
			return "#f80"
		}
	}))
	.create()

onSnapshot(Share, snapshot => { AsyncStorage.setItem('Share', JSON.stringify(snapshot)), console.log("SNAPSHOT:::SHARE") });