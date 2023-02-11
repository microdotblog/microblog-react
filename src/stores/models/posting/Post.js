import { types } from 'mobx-state-tree';

export default Post = types.model('Post', {
  uid: types.identifierNumber,
  name: types.maybe(types.string),
  content: types.maybe(types.string),
  published: types.maybe(types.string)
})
.actions(self => ({

}))