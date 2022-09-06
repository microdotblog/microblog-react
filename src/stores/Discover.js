import { types, flow } from 'mobx-state-tree';
import MicroBlogApi, { API_ERROR } from '../api/MicroBlogApi'

export default Discover = types.model('Discover', {
	tagmoji: types.optional(types.array(types.model('Tagmoji', {
		name: types.maybeNull(types.string),
		title: types.maybeNull(types.string),
		emoji: types.maybeNull(types.string),
		is_featured: types.maybeNull(types.boolean)
	})), []),
	random_tagmoji: types.optional(types.array(types.string), [])
})
.actions(self => ({

	init: flow(function* () {
		console.log("Discover:init")
		const tagmoji = yield MicroBlogApi.get_discover_timeline()
		if (tagmoji !== API_ERROR && tagmoji != null && tagmoji.length > 0) {
			self.tagmoji = tagmoji
			self.random_tagmoji = self.random_emojis()
		}
	}),

	shuffle_random_emoji: flow(function* () { 
		if (self.tagmoji.length === 0) {
			yield self.init()
		}
		self.random_tagmoji = self.random_emojis()
	})

}))
.views(self => ({
	
	random_emojis() {
		const emoji_list = self.tagmoji.map(tagmoji => tagmoji.emoji)
		const emoji_list_length = emoji_list.length
		const emoji_list_random_indexes = []
		for (let i = 0; i < 3; i++) {
			let random_index = Math.floor(Math.random() * emoji_list_length)
			while (emoji_list_random_indexes.includes(random_index)) {
				random_index = Math.floor(Math.random() * emoji_list_length)
			}
			emoji_list_random_indexes.push(random_index)
		}
		return emoji_list.filter((emoji, index) => emoji_list_random_indexes.includes(index))
	}

}))
.create()
