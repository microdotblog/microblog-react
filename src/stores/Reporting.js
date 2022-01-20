import { types, flow } from 'mobx-state-tree';
import { Alert, ToastAndroid } from 'react-native';
import MicroBlogApi, { API_ERROR, REPORTING_ERROR } from '../api/MicroBlogApi'

export default Reporting = types.model('Reporting', {
	is_sending_report: types.optional(types.boolean, false)
})
.actions(self => ({

	init: flow(function* () {
		console.log("Reporting:init")
		const muted_users = yield MicroBlogApi.get_muted_users();
		if (muted_users && muted_users !== API_ERROR) {
			self.muted_users = muted_users;
		}
	}),

	report_user: flow(function* (username) { 
		console.log("Reporting:report_user", username)
		Alert.alert(
			`Report @${username}?`,
			`Report @${username} to Micro.blog for review? We'll look at this user's posts to determine if they violate our community guidelines.`,
			[
				{
					text: "Cancel",
					style: 'cancel',
				},
				{
					text: "Report",
					onPress: () => Reporting.handle_report_user(username),
					style: 'destructive'
				},
			],
			{cancelable: false},
		);
	}),

	handle_report_user: flow(function* (username) {
		console.log("Reporting:handle_report_user", username)
		self.is_sending_report = true;
		const report = yield MicroBlogApi.report_user(username)
		if (report !== REPORTING_ERROR) {
			ToastAndroid.show(`@${username} has been reported.`, ToastAndroid.SHORT);
		}
		else {
			alert("Something went wrong. Please try again.")
		}
		self.is_sending_report = false;
	})

}))
.views(self => ({

}))
.create()
