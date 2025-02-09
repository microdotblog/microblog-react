import { types, flow } from 'mobx-state-tree';
import MicroBlogApi, { API_ERROR, MUTING_ERROR } from '../../api/MicroBlogApi'
import Tokens from '../Tokens';
import Toast from 'react-native-simple-toast';

const MutedItem = types.model("MutedItem", {
	id: types.identifierNumber,
	username: types.maybeNull(types.string),
	domain: types.maybeNull(types.string),
	keyword: types.maybeNull(types.string),
	is_hiding_other_replies: types.optional(types.boolean, false)
})

export default Muting = types.model('Muting', {
	username: types.identifier,
	is_sending_mute: types.optional(types.boolean, false),
	is_sending_unmute: types.optional(types.boolean, false),
	muted_items: types.optional(types.array(MutedItem), [])
})
.actions(self => ({
	
	afterCreate: flow(function* () {
		self.hydrate()
	}),

	hydrate: flow(function* () {
		console.log("Muting:hydrate")
		const muted_items = yield MicroBlogApi.get_muted_users(self.token());
		if (muted_items && muted_items !== API_ERROR) {
			self.muted_items = muted_items;
		}
		self.is_sending_mute = false;
		self.is_sending_unmute = false;
	}),

	mute_user: flow(function* (username, should_block = false) { 
		console.log("Muting:mute_user", username, should_block)
		self.is_sending_mute = true;
		const mute = yield MicroBlogApi.mute_user(username, self.token(), should_block);
		if (mute && mute !== MUTING_ERROR) {
			Toast.showWithGravity(`@${username} has been ${should_block ? "blocked" : "muted"}.`, Toast.SHORT, Toast.CENTER)
			yield self.hydrate()
		}
		else {
			alert("Something went wrong. Please try again.")
		}
		self.is_sending_mute = false;
	}),

	mute_keyword: flow(function* (keyword) {
		console.log("Muting:mute_keyword", keyword)
		self.is_sending_mute = true;
		const mute = yield MicroBlogApi.mute_keyword(keyword, self.token());
		if (mute && mute !== MUTING_ERROR) {
			Toast.showWithGravity(`Posts containing "${keyword}" will be muted.`, Toast.SHORT, Toast.CENTER)
			yield self.hydrate()
		}
		else {
			alert("Something went wrong. Please try again.")
		}
		self.is_sending_mute = false;
	}),

	unmute_item: flow(function* (id) { 
		console.log("Muting:unmute_item", id)
		self.is_sending_unmute = true;
		const item = self.muted_items.find(item => item.id === id)
		const unmute = yield MicroBlogApi.unmute_user(id, self.token());
		if (unmute && unmute !== API_ERROR) {
			if (item) {
				if (item.keyword) {
					Toast.showWithGravity(`"${item.keyword}" has been unmuted.`, Toast.SHORT, Toast.CENTER)
				} else if (item.username) {
					Toast.showWithGravity(`@${item.username} has been ${item.is_hiding_other_replies ? "unblocked" : "unmuted"}.`, Toast.SHORT, Toast.CENTER)
				}
			}
			yield self.hydrate()
		}
		else {
			alert("Something went wrong. Please try again.")
		}
		self.is_sending_unmute = false;
	})

}))
.views(self => ({
	
	token(){
		return Tokens.token_for_username(self.username)?.token
	},

	is_muted(username){
		return self.muted_items.find(item => item.username === username)
	},

	get_mute_id(username) {
		return self.muted_items.find(item => item.username === username)?.id
	},

	get muted_users() {
		return self.muted_items.filter(item => item.username && !item.keyword)
	},

	get blocked_users() {
		return self.muted_items.filter(item => item.username && item.is_hiding_other_replies)
	},

	get muted_keywords() {
		return self.muted_items.filter(item => item.keyword)
	}
		
}))
