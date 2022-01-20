import { types, flow } from 'mobx-state-tree';
import { ToastAndroid } from 'react-native';
import MicroBlogApi, { API_ERROR, MUTING_ERROR } from '../../api/MicroBlogApi'
import Tokens from '../Tokens';

export default Muting = types.model('Muting', {
	username: types.identifier,
	is_sending_mute: types.optional(types.boolean, false),
	is_sending_unmute: types.optional(types.boolean, false),
	muted_users: types.optional(types.array(types.model("Muted", {
		id: types.identifierNumber,
		username: types.maybeNull(types.string),
		domain: types.maybeNull(types.string),
		is_hiding_other_replies: types.optional(types.boolean, false)
	})), []),
})
.actions(self => ({
	
	afterCreate: flow(function* () {
		self.hydrate()
	}),

	hydrate: flow(function* () {
		console.log("Muting:hydrate")
		const muted_users = yield MicroBlogApi.get_muted_users(self.token());
		console.log("Muting:hydrate:muted_users", muted_users)
		if (muted_users && muted_users !== API_ERROR) {
			self.muted_users = muted_users;
		}
		self.is_sending_mute = false;
		self.is_sending_unmute = false;
	}),

	mute_user: flow(function* (username) { 
		console.log("Muting:mute_user", username)
		self.is_sending_mute = true;
		const mute = yield MicroBlogApi.mute_user(username, self.token());
		if (mute && mute !== MUTING_ERROR) {
			ToastAndroid.show(`@${ username } has been muted.`, ToastAndroid.SHORT)
			yield self.hydrate()
		}
		else {
			alert("Something went wrong. Please try again.")
		}
		self.is_sending_mute = false;
	}),

	unmute_user: flow(function* (username) { 
		console.log("Muting:unmute_user", username)
		self.is_sending_unmute = true;
		const unmute = yield MicroBlogApi.unmute_user(self.get_mute_id(username), self.token());
		if (unmute && unmute !== API_ERROR) {
			ToastAndroid.show(`@${ username } has been unmuted.`, ToastAndroid.SHORT);
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
		return self.muted_users.find(user => user.username === username)
	},

	get_mute_id(username) {
		return self.muted_users.find(user => user.username === username)?.id
	}
		
}))
