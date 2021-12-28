import { types } from 'mobx-state-tree';

export default Destination = types.model('Destination', {
	uid: types.identifier,
	name: types.maybeNull(types.string),
	"microblog-audio": types.optional(types.boolean, false),
	"microblog-default": types.optional(types.boolean, false),
	"microblog-title": types.maybeNull(types.string),
	categories: types.optional(types.array(types.string), [])
})
.actions(self => ({

	set_categories(categories) {
		self.categories = categories;
	}

}))