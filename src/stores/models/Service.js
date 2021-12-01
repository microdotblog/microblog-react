import { types, flow } from 'mobx-state-tree';
import Tokens from './../Tokens'

export default Service = types.model('Service', {
  id: types.identifier,
  name: types.maybeNull(types.string),
  url: types.maybeNull(types.string),
  type: types.maybeNull(types.string),
  username: types.maybeNull(types.string),
  is_microblog: types.optional(types.boolean, false)
})
.actions(self => ({

  hydrate: flow(function* () {
    console.log("Endpoint:hydrate", self.id)
  }),
  
  afterCreate: flow(function* () {
    self.hydrate()
  }),

}))
.views(self => ({
  
  credentials(){
    return self.name != null && self.name === "Micro.blog" && self.username != null && self.is_microblog ? Tokens.token_for_username(self.username) : null
  }
  
}))