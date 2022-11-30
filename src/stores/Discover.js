import { types, flow } from 'mobx-state-tree';
import MicroBlogApi, { API_ERROR } from '../api/MicroBlogApi'

export default Discover = types.model('Discover', {
	tagmoji: types.optional(types.array(types.model('Tagmoji', {
		name: types.maybeNull(types.string),
		title: types.maybeNull(types.string),
		emoji: types.maybeNull(types.string),
		is_featured: types.maybeNull(types.boolean)
	})), []),
	random_tagmoji: types.optional(types.array(types.string), []),
	search_shown: types.optional(types.boolean, false),
	search_query: types.optional(types.string, ""),
	search_trigger: types.optional(types.boolean, false)
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
	}),
	
	toggle_search_bar: flow(function* () { 
		self.search_shown = !self.search_shown
		if(!self.search_shown){
			self.search_query = ""
			self.search_trigger = false
		}
	}),
	
	set_search_query: flow(function* (value) { 
		self.search_query = value
		if(value === ""){
			self.search_trigger = false
		}
	}),
	
	trigger_search: flow(function* (value = true) { 
		self.search_trigger = value
		
		setTimeout(() =>{
			self.trigger_search(false)
		}, 50)
		
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
	},
	
	can_show_search(){
		return self.search_shown && self.search_query !== "" && self.search_query.length >= 3
	},
	
	should_load_search(){
		return self.search_trigger
	}

}))
.create()
