import { types, flow } from 'mobx-state-tree';

export default Services = types.model('Services', {
  is_setting_up: types.optional(types.boolean, false)
})
.actions(self => ({
  
  hydrate_with_user: flow(function* (user = null) {
    console.log("Services:hydrate_with_user", user)
  }),
  
}))
.create({})