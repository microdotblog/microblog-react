import { types, flow } from 'mobx-state-tree';
import MicroBlogApi, { API_ERROR } from '../api/MicroBlogApi'

export default Reporting = types.model('Reporting', {
	
})
.actions(self => ({

	init: flow(function* () {
		console.log("Reporting:init")
		
	}),

	report_user: flow(function* (username) { 
		console.log("Reporting:report_user", username)
	}),

	mute_user: flow(function* (username) { 
		console.log("Reporting:mute_user", username)
	}),

	unmute_user: flow(function* (username) { 
		console.log("Reporting:unmute_user", username)
	})

}))
.views(self => ({

}))
.create()
