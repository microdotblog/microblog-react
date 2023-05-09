import { types, flow } from 'mobx-state-tree';
import XMLRPCApi, { RSD_NOT_FOUND, BLOG_ID_NOT_FOUND, XML_ERROR } from '../api/XMLRPCApi';
import MicroPubApi, { MICROPUB_NOT_FOUND, FETCH_ERROR, NO_AUTH } from '../api/MicroPubApi';
import Auth from "./Auth";
import { blog_services } from './enums/blog_services';
import Tokens from "./Tokens";
import { Alert, Linking } from 'react-native';

export default Services = types.model('Services', {
  is_setting_up: types.optional(types.boolean, false),
  current_url: types.optional(types.string, ""),
  current_username: types.optional(types.string, ""),
  xml_endpoint: types.optional(types.string, ""),
  micropub_endpoint: types.optional(types.string, ""),
  auth_endpoint: types.optional(types.string, ""),
  token_endpoint: types.optional(types.string, ""),
  blog_id: types.optional(types.string, ""),
  show_credentials: types.optional(types.boolean, false),
  checking_credentials: types.optional(types.boolean, false),
  temp_username: types.optional(types.string, ""),// We don't save the Services model in Async, so this is all temp data
  temp_password: types.optional(types.string, ""),// We don't save the Services model in Async, so this is all temp data
  temp_micropub_token: types.optional(types.string, ""),
  did_set_up_successfully: types.optional(types.boolean, false)
})
.actions(self => ({
  
  hydrate_with_user: flow(function* (user = null) {
    console.log("Services:hydrate_with_user", user)
    self.current_username = user.username
    if(user != null && !user.posting?.selected_service?.is_microblog){
      self.current_url = user.posting?.selected_service?.name // I know, bad property name
      self.did_set_up_successfully = true
    }
    else if(user != null && user.posting?.first_custom_service()?.name){
      self.current_url = user.posting?.first_custom_service().name
      self.did_set_up_successfully = true
    }
    else{
      self.current_url = ""
    }
    self.xml_endpoint = ""
    self.micropub_endpoint = ""
    self.auth_endpoint = ""
    self.token_endpoint = ""
    self.blog_id = ""
  }),
  
  clear: flow(function* () {
    console.log("Services:clear")
    self.current_url = ""
    self.xml_endpoint = ""
    self.micropub_endpoint = ""
    self.auth_endpoint = ""
    self.token_endpoint = ""
    self.blog_id = ""
    self.show_credentials = false
    self.did_set_up_successfully = false
  }),
  
  set_url: flow(function* (text) {
    self.current_url = text
    if(self.show_credentials){
      self.show_credentials = false
    }
  }),
  
  setup_new_service: flow(function* () {
    console.log("Services:setup_new_service", self.current_url)
    self.is_setting_up = true
    
    // assume HTTPS if no scheme
    var discover_url = self.current_url
    if (!discover_url.includes("http")) {
      discover_url = "https://" + discover_url
    }
  
    // check for Micropub first, then try XML-RPC
    const micropub_endpoints = yield MicroPubApi.discover_micropub_endpoints(discover_url)
    if (micropub_endpoints !== MICROPUB_NOT_FOUND) {
      console.log("Micropub: Found endpoints:", micropub_endpoints)
      self.micropub_endpoint = micropub_endpoints["micropub"]
      self.auth_endpoint = micropub_endpoints["auth"]
      self.token_endpoint = micropub_endpoints["token"]
      let auth_url = MicroPubApi.make_auth_url(discover_url, micropub_endpoints["auth"])
      console.log("Micropub: Make auth:", auth_url)
      Linking.openURL(auth_url)
    }
    else {
      const rsd_link = yield XMLRPCApi.discover_rsd_endpoint(discover_url)
      console.log("Services:setup_new_service:rsd_link", rsd_link)
      if(rsd_link !== RSD_NOT_FOUND){
        // OK, so we found the RSD link, now we need to get the preferred blog ID
        self.xml_endpoint = rsd_link.replace("?rsd", "")
        const blog_id = yield XMLRPCApi.discover_preferred_blog(rsd_link)
        console.log("Services:setup_new_service:blog_id", blog_id)
        if(blog_id !== BLOG_ID_NOT_FOUND){
          // We found a blog id, nice!
          self.blog_id = blog_id
          self.show_credentials = true
        }
      }
      else{
        Alert.alert("Sorry, we could not find the XML-RPC endpoint or Micropub API for your weblog.")
      }
    }
    
    self.is_setting_up = false
  }),
  
  set_username: flow(function* (text) {
    self.temp_username = text
  }),
  
  set_password: flow(function* (text) {
    self.temp_password = text
  }),
  
  check_credentials_and_proceed_setup: flow(function* () {
    console.log("Services:check_credentials")
    self.checking_credentials = true
    const data = yield XMLRPCApi.check_credentials_and_get_recent_posts(self.xml_endpoint, self.blog_id, self.temp_username, self.temp_password)
    console.log("Services:check_credentials:data", JSON.stringify(data))
    if(data !== XML_ERROR){
      // If we got this far, let's go ahead and add a new service for the user
      const user = Auth.user_from_username(self.current_username)
      console.log("Services:check_credentials_and_proceed_setup:user", user)
      if(user && user?.posting != null){
        // We've got a user and posting, now let's set up the service
        const service = yield user.posting?.create_new_service(blog_services["xmlrpc"], self.current_url, self.xml_endpoint, self.temp_username, self.blog_id)
        console.log("Services:check_credentials_and_proceed_setup:service", service)
        if(service){
          // Now that we have a service, let's save a token
          const token = yield Tokens.create_new_service_token(self.temp_username, self.temp_password, service.id)
          console.log("Services:check_credentials_and_proceed_setup:token", token != null)
          if(token != null){
            // Now we have a saved token! Let's set the service as the active one.
            const activated = yield user.posting?.activate_new_service(service)
            if(activated){
              // We need to change the state of the current active one displayed on the page...
            }
          }
        }
      }
    }
    self.checking_credentials = false
  }),
  
  check_micropub_credentials_and_proceed_setup: flow(function* (url) {
    console.log("Services:check_micropub_credentials_and_proceed_setup", url)
    self.checking_credentials = true
    if(url != null){
      const token = yield MicroPubApi.verify_code(self, url)
      console.log("Services:check_micropub_credentials_and_proceed_setup:data", self.micropub_endpoint)
      if(token !== NO_AUTH && token !== FETCH_ERROR && self.micropub_endpoint){
        // Now that we have a token, let's try and get the config
        const temp_service_object = {
          endpoint: self.micropub_endpoint,
          token: token
        }
        const config = yield MicroPubApi.get_config(temp_service_object)
        console.log("Services:check_micropub_credentials_and_proceed_setup:config", config)
        if(config !== FETCH_ERROR){
          const user = Auth.user_from_username(self.current_username)
          console.log("Services:check_micropub_credentials_and_proceed_setup:user", user)
          if(user && user?.posting != null){
            const service = yield user.posting?.create_new_service(blog_services["micropub"], self.current_url, temp_service_object.endpoint, self.current_username)
            console.log("Services:check_credentials_and_proceed_setup:service", service)
            if(service){
              // Now that we have a service, let's save a token
              const new_token = yield Tokens.create_new_service_token(self.current_username, temp_service_object.token, service.id)
              console.log("Services:check_micropub_credentials_and_proceed_setup:token", new_token != null)
              if(new_token != null){
                // Now we have a saved token! Let's set the service as the active one.
                const config_is_set_up = yield service.set_initial_config(config)
                if(config_is_set_up){
                  const activated = yield user.posting?.activate_new_service(service)
                  if(activated){
                    // We need to change the state of the current active one displayed on the page...
                    self.did_set_up_successfully = true
                  }
                }
                else{
                  Alert.alert("Sorry, something went wrong setting up your Micropub endpoint. Please try again.")
                }
              }
            }
          }
        }
      }
    }
    self.checking_credentials = false
  }),
  
  set_microblog_service: flow(function* () {
    console.log("Services:set_microblog_service")
    const user = Auth.user_from_username(self.current_username)
    console.log("Services:set_microblog_service:user", user)
    if(user && user?.posting != null){
      const service = yield user.posting.set_default_service()
      if(service != null){
        console.log("Services:set_microblog_service:new_service_set_up", service)
        service.hydrate()
      }
    }
  }),
  
  set_custom_service: flow(function* () {
    console.log("Services:set_custom_service")
    const user = Auth.user_from_username(self.current_username)
    console.log("Services:set_custom_service:user", user)
    if(user && user?.posting != null){
      const service = yield user.posting.set_custom_service()
      if(service != null){
        console.log("Services:set_custom_service:new_service_set_up", service)
        service.hydrate()
      }
    }
  }),
  
  remove_custom_service: flow(function* () {
    console.log("Services:remove_custom_service")
    if(Services.current_user() != null && Services.current_user()?.posting != null){
      if(!Services.current_user()?.posting.selected_service?.is_microblog){
        const service = yield Services.current_user().posting.set_default_service()
        if(service != null){
          console.log("Services:remove_custom_service:new_service_set_up", service)
          service.hydrate()
        }
      }
      Services.current_user()?.posting.remove_custom_services()
      self.clear()
    }
  })
  
}))
.views((self) => ({
  
  can_set_up(){
    return self.current_url.length > 0
  },
  
  should_show_set_up(){
    return !self.did_set_up_successfully
  },
  
  can_set_up_credentials(){
    // Let's check that we have a Blog ID and endpoint
    return self.xml_endpoint != "" && self.blog_id != ""
  },
  
  has_credentials(){
    return self.temp_password != "" && self.temp_username != ""
  },
  
  current_user(){
    return Auth.user_from_username(self.current_username)
  }
  
}))
.create({})