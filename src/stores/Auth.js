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

}))
.views(self => ({
  
  is_logged_in(){
    return self.users.length && self.selected_user != null
  }
  
}))
.create();