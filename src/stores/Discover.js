import { types, flow } from 'mobx-state-tree';
import MicroBlogApi, { API_ERROR } from '../api/MicroBlogApi'

export default Discover = types.model('Discover', {
	tagmoji: types.optional(types.array(types.model('Tagmoji', {
		name: types.maybeNull(types.string),
		title: types.maybeNull(types.string),
		emoji: types.maybeNull(types.string),
		is_featured: types.maybeNull(types.boolean)
	})), [])
})
.actions(self => ({

	init: flow(function* () {
		console.log("Discover:init")
		const tagmoji = yield MicroBlogApi.get_discover_timeline()
		if (tagmoji !== API_ERROR && tagmoji != null && tagmoji.length > 0) {
			console.log("Discover:init:tagmoji", tagmoji)
			self.tagmoji = tagmoji
		}
	})

}))
.create()
