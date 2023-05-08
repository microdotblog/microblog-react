import { types, flow } from 'mobx-state-tree';
import XMLRPCApi, { RSD_NOT_FOUND, BLOG_ID_NOT_FOUND, XML_ERROR } from '../api/XMLRPCApi';
import MicroPubApi, { MICROPUB_NOT_FOUND } from '../api/MicroPubApi';
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
  temp_micropub_token: types.optional(types.string, "")
})
.actions(self => ({
  
  hydrate_with_user: flow(function* (user = null) {
    console.log("Services:hydrate_with_user", user)
    self.current_username = user.username
    self.current_url = "" // TODO: Fetch all services for user and populate
    self.xml_endpoint = ""
    self.micropub_endpoint = ""
    self.auth_endpoint = ""
    self.token_endpoint = ""
    self.blog_id = ""
    
    Linking.addEventListener('url', (event) => {
      console.log("Services:hydrate_event_listener:event", event)
      if(event?.url && event?.url.includes('/indieauth') && Auth.is_logged_in()){
        // auth code will come back like microblog://indieauth?code=ABCDE&state=12345
        console.log("Micropub:Opened app with IndieAuth")
        Services.check_micropub_credentials_and_proceed_setup(event?.url)
      }
    })
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
      const data = yield MicroPubApi.verify_code(self, url)
      console.log("Services:check_micropub_credentials_and_proceed_setup:data", data)
    }
    self.checking_credentials = false
  })
  
}))
.views((self) => ({
  
  can_set_up(){
    return self.current_url.length > 0
  },
  
  should_show_set_up(){
    // TODO: Check if the user has existing credentials, if not, show the set up button
    return true
  },
  
  can_set_up_credentials(){
    // Let's check that we have a Blog ID and endpoint
    return self.xml_endpoint != "" && self.blog_id != ""
  },
  
  has_credentials(){
    return self.temp_password != "" && self.temp_username != ""
  }
  
}))
.create({})