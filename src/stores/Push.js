import { types, flow, destroy } from 'mobx-state-tree';
import MicroBlogApi, { API_ERROR } from '../api/MicroBlogApi'
import PushNotification from "react-native-push-notification";
import Notification from './models/Notification'
import Auth from './Auth'
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import { Platform, PermissionsAndroid } from 'react-native'
import App from './App'
import Device from './models/Device'

export default Push = types.model('Push', {
	token: types.optional(types.string, ""),
	notifications: types.optional(types.array(Notification), []),
	notificiations_open: types.optional(types.boolean, false),
	devices: types.optional(types.map(types.array(Device)), {})
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
				Push.handle_notification(data)
			},
			onAction: function(data){
				console.log("Push:onAction:data", data);
			},
			permissions: {
				alert: true,
				badge: true,
				sound: true
			},
			popInitialNotification: true,
			requestPermissions: true
		})
	}),
	
	set_token: flow(function* (token) {
		console.log("Push::set_token", token)
		self.token = token
	}),

	register_token: flow(function* (user_token) {
		console.log("Push:register_token")
		
		if (self.token != null && self.token != "" && user_token != null && Auth.is_logged_in()) {
			const data = yield MicroBlogApi.register_push(self.token, user_token)
			if (data !== API_ERROR) {
				console.log("Push:register_token:OK")
				return true
			}
		}
		else if(self.token == "" && Auth.is_logged_in() && self.has_push_permissions){
		  Push.request_permissions()
		}
		return false
	}),

	unregister_user_from_push: flow(function* (user_token) {
		console.log("Push:unregister_user_from_push")
		if (self.token != null && self.token != "" && user_token != null) {
			const data = yield MicroBlogApi.unregister_push(self.token, user_token)
			if (data !== API_ERROR) {
				console.log("Push:unregister_user_from_push:OK")
				return true
			}
		}
		else if(self.token == ""){
		  return true
		}
		return false
	}),

	clear_notifications: flow(function* () {
		console.log("Push::clear_notifications")
		PushNotification.cancelAllLocalNotifications()
	}),

	remove_notification: flow(function* (id) {
		console.log("Push::remove_notification", id)
		PushNotification.cancelLocalNotification(id)
	}),
	
	remove_all_notifications: flow(function* () {
		console.log("Push::remove_all_notifications")
		self.notifications.forEach(notification => {
			Push.remove_notification(notification.id)
			destroy(notification)
		})
		Push.close_notification_sheet()
	}),

	check_and_remove_notifications_with_post_id: flow(function* (post_id) {
		console.log("Push::check_and_remove_notifications_with_post_id", post_id)
		if (self.notifications) {
			const notifications = self.notifications.filter(n => n.post_id === post_id)
			if (notifications) {
				notifications.forEach(notification => {
					Push.remove_notification(notification.id)
					destroy(notification)
				})
				if(self.notifications.length === 0){
					Push.close_notification_sheet()
				}
			}
		}
	}),

	handle_notification: flow(function* (notification) {
		console.log("Push::handle_notification", notification, Auth.selected_user)
		const nice_notification_object = {
			id: Platform.OS === 'ios' ? notification.data?.notificationId != null ? notification.data?.notificationId : notification.data?.post_id : notification.id,
			message: notification.message,
			post_id: notification.data?.post_id,
			to_username: Platform.OS === 'ios' ? notification.data?.to_user?.username : JSON.parse(notification.data?.to_user)?.username,
			from_username: Platform.OS === 'ios' ? notification.data?.from_user?.username : JSON.parse(notification.data?.from_user)?.username,
			should_open: Platform.OS === 'ios'  && notification.foreground === false,
			did_load_before_user_was_loaded: Auth.selected_user == null
		}
		// Check if we have an existing notification in our array.
		// This will never happen, except for DEV for sending through test messages.
		const existing_notification = self.notifications.find(notification => notification.id === nice_notification_object.id)
		if (existing_notification) {
			destroy(existing_notification)
		}
		self.notifications.push(Notification.create(nice_notification_object))
		Push.open_notification_sheet()
	}),
	
	open_notification_sheet: flow(function* () {
		console.log("Push::open_notification_sheet")
		if (!self.notificiations_open) {
			if (self.valid_notifications().length > 0) {
				App.open_sheet("notifications_sheet")
			}
		}
	}),
	
	close_notification_sheet: flow(function* () {
		console.log("Push::close_notification_sheet")
		App.close_sheet("notifications_sheet")
	}),
	
	toggle_notifications_open: flow(function* (open = true) {
		console.log("Push::toggle_notifications_open", open)
		self.notificiations_open = open
	}),

	request_permissions: flow(function* (user_token = null) {
		console.log("Push::request_permissions")
		if (Platform.OS === 'ios') {
			yield PushNotificationIOS.requestPermissions()
		}
		else if(Platform.OS === 'android'){
			yield PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
		}
		
		if(self.has_push_permissions() && user_token){
		  return yield self.register_token(user_token)
		}
	}),
	
	set_devices_for_user: flow(function* (username, devices) {
		console.log("Push::set_devices_for_user", username)
		self.devices.set(username, devices)
	}),

}))
.views(self => ({
  
	valid_notifications() {
		return self.notifications.filter(n => n.can_show_notification())
	},
	
	handle_first_notification() {
		return self.notifications.find(n => n.did_load_before_user_was_loaded)?.handle_action()
	},
	
	has_push_permissions(callback) {
		if (Platform.OS === 'ios') {
			PushNotificationIOS.checkPermissions((permissions) => {
				callback(permissions.alert)
			})
		} else {
			callback(true)
		}
	},
	
	is_registered_device_for_user(username) {
		return self.devices.get(username)?.some(device => device.token === Push.token)
	}
	
}))
.create({})
