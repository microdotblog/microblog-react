import { types } from 'mobx-state-tree'

export default Post = types.model('Upload', {
	url: types.identifier,
	published: types.maybe(types.string)
})
	.views(self => ({
		nice_local_published_date() {
			const date = new Date(self.published)
			return date.toLocaleString()
		}
	}))