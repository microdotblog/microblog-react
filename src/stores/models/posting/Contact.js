import { types, flow } from 'mobx-state-tree';

export default Contact = types.model('Contact', {
	username: types.maybe(types.string),
	avatar: types.maybe(types.string)
})
.actions(self => ({
}))