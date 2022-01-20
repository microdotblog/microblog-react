import { types, flow } from 'mobx-state-tree';
import Tokens from './../Tokens';
import Posting from './Posting';
import FastImage from 'react-native-fast-image';
import Muting from './Muting'

export default User = types.model('User', {
    username: types.identifier,
    avatar: types.maybeNull(types.string),
    has_site: types.maybeNull(types.boolean, false),
    default_site: types.maybeNull(types.string),
    full_name: types.maybeNull(types.string),
    posting: types.maybeNull(Posting),
    muting: types.maybeNull(Muting),
  })
  .actions(self => ({

    hydrate: flow(function* () {
      console.log("HYDRATING USER", self.username)
      if(self.avatar){
        FastImage.preload([{uri: self.avatar}])
      }
      if(self.posting == null){
        self.posting = Posting.create({username: self.username})
      }
      else {
        self.posting.hydrate()
      }
      if (self.muting == null) {
        self.muting = Muting.create({username: self.username})
      }
      else {
        self.muting.hydrate()
      }
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
