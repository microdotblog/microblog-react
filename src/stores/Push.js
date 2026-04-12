import { types, flow, destroy } from 'mobx-state-tree'
import MicroBlogApi, { API_ERROR } from '../api/MicroBlogApi'
import PushNotification from "react-native-push-notification"
import Notification from './models/Notification'
import Auth from './Auth'
import PushNotificationIOS from "@react-native-community/push-notification-ios"
import { Platform, PermissionsAndroid } from 'react-native'
import App from './App'
import Device from './models/Device'
import {
	normalise_notification_payload,
	determine_notification_action,
	determine_pending_notification_action
} from '../utils/push_notifications'

export default Push = types.model('Push', {
	token: types.optional(types.string, ""),
	notifications: types.optional(types.array(Notification), []),
	notificiations_open: types.optional(types.boolean, false),
	devices: types.optional(types.map(types.array(Device)), {}),
	pending_notification: types.maybeNull(types.frozen()),
	auth_ready: types.optional(types.boolean, false)
})
.actions(self => ({

	hydrate: flow(function* () {
		console.log("Push:hydrate")
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

	set_pending_notification: flow(function* (notification) {
		console.log("Push:set_pending_notification", notification)
		self.pending_notification = notification
	}),

	clear_pending_notification: flow(function* () {
		console.log("Push:clear_pending_notification")
		self.pending_notification = null
	}),

	set_auth_ready: flow(function* (ready = true) {
		console.log("Push:set_auth_ready", ready)
		self.auth_ready = ready
	}),

	store_notification: flow(function* (notification) {
		console.log("Push:store_notification", notification)
		const existing_notification = self.notifications.find(item => item.id === notification.id)
		if (existing_notification) {
			destroy(existing_notification)
		}
		self.notifications.push(Notification.create(notification))
	}),

	open_notification: flow(function* (notification) {
		console.log("Push:open_notification", notification)
		const local_user = self.local_user_for_notification(notification)
		if (local_user != null && notification?.post_id != null) {
			if (Auth.selected_user !== local_user) {
				yield Auth.select_user(local_user)
			}
			App.navigate_to_screen("open", notification.post_id)
			Push.close_notification_sheet()
			return true
		}
		return false
	}),

	schedule_pending_notification_replay: flow(function* () {
		console.log("Push:schedule_pending_notification_replay")
		;[0, 250, 500, 1000, 1500, 2500, 4000, 6000].forEach((delay) => {
			setTimeout(() => {
				Push.replay_pending_notification()
			}, delay)
		})
	}),

	handle_notification: flow(function* (notification) {
		console.log("Push::handle_notification", notification, Auth.selected_user)
		const nice_notification_object = normalise_notification_payload(notification, Platform.OS)
		const action = determine_notification_action({
			notification: nice_notification_object,
			has_navigation: self.has_navigation(),
			has_local_user: self.local_user_for_notification(nice_notification_object) != null,
			is_app_active: self.is_app_active()
		})

		if (action === 'open') {
			return yield Push.open_notification(nice_notification_object)
		}

		if (action === 'queue') {
			yield Push.set_pending_notification(nice_notification_object)
			yield Push.schedule_pending_notification_replay()
			return false
		}

		yield Push.store_notification({
			...nice_notification_object,
			should_open: false
		})
		yield Push.open_notification_sheet()
		return false
	}),

	replay_pending_notification: flow(function* () {
		console.log("Push:replay_pending_notification", self.pending_notification)
		if (self.pending_notification == null) {
			return false
		}

		if (!self.auth_ready) {
			console.log("Push:replay_pending_notification:waiting_for_auth")
			return false
		}

		const pending_notification = self.pending_notification
		const action = determine_pending_notification_action({
			notification: pending_notification,
			has_navigation: self.has_navigation(),
			has_local_user: self.local_user_for_notification(pending_notification) != null,
			is_app_active: self.is_app_active()
		})
		console.log("Push:replay_pending_notification:action", action, {
			has_navigation: self.has_navigation(),
			has_local_user: self.local_user_for_notification(pending_notification) != null,
			is_app_active: self.is_app_active(),
			navigation_ready: App.navigation_ready,
			app_state: App.app_state
		})

		if (action === 'wait') {
			return false
		}

		yield Push.clear_pending_notification()

		if (action === 'open') {
			return yield Push.open_notification(pending_notification)
		}

		yield Push.store_notification({
			...pending_notification,
			should_open: false
		})
		yield Push.open_notification_sheet()
		return false
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
		return self.pending_notification != null ? Push.replay_pending_notification() : null
	},
	
	has_push_permissions(callback) {
		if (Platform.OS === 'ios') {
			PushNotificationIOS.checkPermissions((permissions) => {
				callback(permissions.alert)
			})
		} else {
			PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
				.then((hasPermission) => {
					callback(hasPermission)
				})
				.catch(() => {
					callback(false)
				})
		}
	},
	
	is_registered_device_for_user(username) {
		return self.devices.get(username)?.some(device => device.token === Push.token)
	},

	local_user_for_notification(notification) {
		if (notification?.to_username == null) {
			return null
		}
		return Auth.users.find(u => u.username === notification.to_username)
	},

	has_navigation() {
		return App.navigation_ref != null
			&& App.navigation_ready
			&& (typeof App.navigation_ref.isReady !== 'function' || App.navigation_ref.isReady())
	},

	is_app_active() {
		return App.app_state === 'active'
	}
	
}))
.create({})
