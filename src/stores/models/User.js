import { types, flow } from 'mobx-state-tree';
import Profile from './Profile';
import Tokens from './../Tokens';
import FastImage from 'react-native-fast-image';

export default User = types.model('User', {
    username: types.identifier,
    avatar: types.maybeNull(types.string),
    has_site: types.maybeNull(types.boolean, false),
    default_site: types.maybeNull(types.string),
    profile: types.maybeNull(Profile),
    full_name: types.maybeNull(types.string)
  })
  .actions(self => ({

    hydrate: flow(function* () {
      console.log("HYDRATING USER", self.username)
      if(self.avatar){
        FastImage.preload([{uri: self.avatar}])
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
