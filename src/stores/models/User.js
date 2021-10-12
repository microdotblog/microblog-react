import { types, flow } from 'mobx-state-tree';
import Profile from './Profile';

export default User = types.model('User', {
    token: types.identifier,
    username: types.maybe(types.string),
    avatar_url: types.maybe(types.string),
    has_site: types.maybeNull(types.boolean, false),
    default_site: types.maybeNull(types.string),
    profile: types.maybeNull(Profile)
  })
  .actions(self => ({

    hydrate: flow(function* () {
      console.log("HYDRATING USER")
    }),
    
    afterCreate: flow(function* () {
      self.hydrate()
    }),
    
  }))
  .views(self => ({
  }))
