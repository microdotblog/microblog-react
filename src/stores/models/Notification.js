import { types, flow, destroy } from 'mobx-state-tree';
import MicroBlogApi from '../../api/MicroBlogApi'
import App from '../App'
import Auth from '../Auth'

export default Notification = types.model('Notification', {
	id: types.identifier,
	post_id: types.maybeNull(types.string),
	message: types.maybeNull(types.string),
	from_username: types.maybeNull(types.string),
	from_avatar_url: types.maybeNull(types.string),
	to_username: types.maybeNull(types.string),
	should_open: types.maybeNull(types.boolean),
	did_load_before_user_was_loaded: types.maybeNull(types.boolean)
})
.actions(self => ({

	hydrate: flow(function* () {
		console.log("Notification:hydrate")
		if (self.from_username) {
			const profile = yield MicroBlogApi.get_profile(self.from_username)
			if (profile) {
				console.log("Notification:hydrate:profile", profile.author?.avatar)
				self.from_avatar_url = profile.author?.avatar
			}
		}
	}),
	
	afterCreate: flow(function* () {
		if (self.should_open != null && self.should_open) {
			self.handle_action()
		}
		else{
			self.hydrate()
		}
	}),

	handle_action: flow(function* () { 
		console.log("Notification:handle_action", self, self.local_user())
		if (self.local_user() != null) {
			if (Auth.selected_user !== self.local_user()) {
				yield Auth.select_user(self.local_user())
			}
			App.navigate_to_screen("open", self.post_id)
		}
	}),

	remove: flow(function* () {
		destroy(self)
	})
	
}))
.views(self => ({
	
	local_user() {
		return Auth.users.find(u => u.username === self.to_username)
	},

	can_show_notification() {
		return self.message && this.local_user() != null && !self.should_open
	},

	trimmed_message() {
		if (self.message.length > 255) {
			return `${self.message.slice(0, 250)}...`
		}
		return self.message
	}
		
}))
