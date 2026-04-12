import PushNotification from 'react-native-push-notification'
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import { AppState } from 'react-native'
import Push from '../stores/Push'

let did_bootstrap = false

export function bootstrap_push_notifications() {
	if (did_bootstrap) {
		return
	}

	did_bootstrap = true
	console.log("Push:bootstrap:start", AppState.currentState)

	PushNotification.configure({
		onRegister: function (data) {
			console.log("Push:bootstrap:onRegister:data", data)
			Push.set_token(data.token)
		},
		onRegistrationError: function (error) {
			console.log("Push:bootstrap:onRegistrationError:error", error)
		},
		onNotification: function (notification) {
			console.log("Push:bootstrap:onNotification", notification)
			Push.handle_notification(notification)
			if (typeof notification?.finish === 'function') {
				notification.finish(PushNotificationIOS.FetchResult.NoData)
			}
		},
		onAction: function (data) {
			console.log("Push:bootstrap:onAction:data", data)
		},
		permissions: {
			alert: true,
			badge: true,
			sound: true
		},
		popInitialNotification: true,
		requestPermissions: true
	})

	AppState.addEventListener('change', (nextAppState) => {
		console.log("Push:bootstrap:app_state", nextAppState)
	})
}

bootstrap_push_notifications()
