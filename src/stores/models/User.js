import { types, flow } from 'mobx-state-tree';
import Profile from './Profile';
import Tokens from './../Tokens';

export default User = types.model('User', {
    username: types.identifier,
    avatar_url: types.maybeNull(types.string),
    has_site: types.maybeNull(types.boolean, false),
    default_site: types.maybeNull(types.string),
    profile: types.maybeNull(Profile),
    full_name: types.maybeNull(types.string)
  })
  .actions(self => ({

    hydrate: flow(function* () {
      console.log("HYDRATING USER", self.username)
    }),
    
    afterCreate: flow(function* () {
      self.hydrate()
    }),
    
  }))
  .views(self => ({
    
    token(){
      return Tokens.token_for_username(self.username)?.token
    }
    
  }))
