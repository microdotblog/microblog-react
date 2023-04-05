import { types, flow } from 'mobx-state-tree';
import Tokens from './../../Tokens';

export default User = types.model('ShareUser', {
    username: types.identifier,
    avatar: types.maybeNull(types.string),
    has_site: types.maybeNull(types.boolean, false),
    default_site: types.maybeNull(types.string)
  })
  .actions(self => ({

    hydrate: flow(function* () {
      console.log("HYDRATING SHARE USER", self.username)
      
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
