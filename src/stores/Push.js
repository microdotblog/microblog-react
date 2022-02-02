import { types, flow } from 'mobx-state-tree';
import MicroBlogApi, { API_ERROR } from '../api/MicroBlogApi'
import Auth from './Auth'
import PushNotification from "react-native-push-notification";

export default Push = types.model('Push', {
  token: types.optional(types.string, "")
})
.actions(self => ({

  hydrate: flow(function* () {
		console.log("Push:hydrate")

		PushNotification.configure({
			onRegister: function (data) {
				console.log("Push:hydrate:onRegister:data", data);
				Push.set_token(data.token)
			},
			onRegistrationError: function (error) {
				console.log("Push:hydrate:onRegistrationError:error", error);
			},
			onNotification: function(data) {
				console.log("Push:onNotification", data)
			},
			permissions: {
				alert: true,
				badge: true,
				sound: true
			},
			popInitialNotification: true,
			requestPermissions: true
		});
	}),
	
	set_token: flow(function* (token) {
		console.log("Push::set_token", token)
		self.token = token
	}),

}))
.create({})