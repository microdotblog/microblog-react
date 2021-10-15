import { types, flow } from 'mobx-state-tree';
import User from './models/User'

export default Auth = types.model('Auth', {
  users: types.optional(types.array(User), []),
  selected_user: types.maybeNull(types.reference(User))
})
.actions(self => ({

  hydrate: flow(function* () {
    console.log("Auth:hydrate")
    return self.is_logged_in()
  }),
  
  handle_new_login: flow(function* (data) {
    console.log("Auth:handle_new_login", data)
    
  }),

}))
.views(self => ({
  
  is_logged_in(){
    return self.users.length && self.selected_user != null
  }
  
}))
.create();