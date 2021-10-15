import { types, flow, applySnapshot } from 'mobx-state-tree';
import AsyncStorage from "@react-native-async-storage/async-storage";
import User from './models/User'
import Tokens from './Tokens'

export default Auth = types.model('Auth', {
  users: types.optional(types.array(User), []),
  selected_user: types.maybeNull(types.reference(User))
})
.actions(self => ({

  hydrate: flow(function* () {
    console.log("Auth:hydrate")
    yield Tokens.hydrate()
    const data = yield AsyncStorage.getItem('Auth')
    if (data) {
      applySnapshot(self, JSON.parse(data))
      console.log("Auth:hydrate:with_data", data)
    }
    return self.is_logged_in()
  }),
  
  handle_new_login: flow(function* (data) {
    console.log("Auth:handle_new_login", data)
    if(data?.username != null && data?.token != null){
      const token = yield Tokens.add_new_token(data.username, data.token)
      console.log("Auth:handle_new_login:token", token)
      if(token && token.username === data?.username){
        yield self.create_and_select_new_user(data)
        return true
      }
    }
    return false
  }),
  
  create_and_select_new_user: flow(function* (data) {
    console.log("Auth:create_and_select_new_user", data)
    const existing_user = self.users.find(u => u.username === data.username)
    if(existing_user != null ){
      // TODO: JUST UPDATE THE USER AND SELECT
      self.selected_user = existing_user
    }
    else{
      const new_user = User.create(data)
      self.users.push(new_user)
      self.selected_user = new_user
    }
    console.log("Auth:create_and_select_new_user:users", self.users.length)
  }),

}))
.views(self => ({
  
  is_logged_in(){
    return self.users.length && self.selected_user != null && self.selected_user.token() != null
  }
  
}))
.create();