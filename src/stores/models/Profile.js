import { types } from 'mobx-state-tree';

export default Profile = types.model('Profile', {
    name: types.maybe(types.string),
    username: types.maybe(types.string),
    bio: types.maybe(types.string),
    url: types.maybe(types.string),
    following_count: types.maybe(types.number),
    avatar: types.maybe(types.string)
  })
  .actions(self => ({
  }))
  .views(self => ({
  }))
