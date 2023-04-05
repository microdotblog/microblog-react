import { types, flow } from 'mobx-state-tree';
import Tokens from './../../Tokens';
import SharePosting from './SharePosting'

export default User = types.model('ShareUser', {
  username: types.identifier,
  avatar: types.maybeNull(types.string),
  has_site: types.maybeNull(types.boolean, false),
  default_site: types.maybeNull(types.string),
  posting: types.maybeNull(SharePosting)
})
  .actions(self => ({

    hydrate: flow(function* () {
      console.log("ShareUser:hydrate", self.username)
      self.fetch_data()
    }),
    
    afterCreate: flow(function* () {
      self.hydrate()
    }),

    fetch_data: flow(function* () {
      console.log("ShareUser:fetch_data", self.username)
      if(self.posting == null){
        self.posting = SharePosting.create({username: self.username})
      }
      else {
        self.posting.hydrate()
      }
    })
    
  }))
  .views(self => ({
    
    token(){
      return Tokens.token_for_username(self.username)?.token
    }
    
  }))
