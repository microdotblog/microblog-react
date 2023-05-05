import { types, flow } from 'mobx-state-tree';
import StringChecker from '../utils/string_checker';

export default Services = types.model('Services', {
  is_setting_up: types.optional(types.boolean, false),
  current_url: types.optional(types.string, "")
})
.actions(self => ({
  
  hydrate_with_user: flow(function* (user = null) {
    console.log("Services:hydrate_with_user", user)
  }),
  
  set_url: flow(function* (text) {
    console.log("Services:set_url", text)
    self.current_url = text
  })
  
}))
.views((self) => ({
  
  can_set_up(){
    // We want to check if the URL is a URL
    return StringChecker._validate_url(self.current_url)
  },
  
  should_show_set_up(){
    // TODO: Check if the user has existing credentials, if not, show the set up button
    return true
  }
  
}))
.create({})