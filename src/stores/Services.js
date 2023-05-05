import { types, flow } from 'mobx-state-tree';
import StringChecker from '../utils/string_checker';
import XMLRPCApi, { RSD_NOT_FOUND } from '../api/XMLRPCApi';

export default Services = types.model('Services', {
  is_setting_up: types.optional(types.boolean, false),
  current_url: types.optional(types.string, ""),
  current_username: types.optional(types.string, "")
})
.actions(self => ({
  
  hydrate_with_user: flow(function* (user = null) {
    console.log("Services:hydrate_with_user", user)
    self.current_username = user.username
  }),
  
  set_url: flow(function* (text) {
    console.log("Services:set_url", text)
    self.current_url = text
  }),
  
  setup_new_service: flow(function* () {
    console.log("Services:setup_new_service", self.current_url)
    self.is_setting_up = true
    // For now, let's just figure out XMLRPC endpoint
    const rsd_link = yield XMLRPCApi.discover_rsd_endpoint(self.current_url)
    console.log("Services:setup_new_service", rsd_link)
    if(rsd_link !== RSD_NOT_FOUND){
      
    }
    self.is_setting_up = false
    
  }),
  
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