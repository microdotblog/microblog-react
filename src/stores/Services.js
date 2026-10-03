import { Alert } from 'react-native'
import { types, flow } from 'mobx-state-tree'
import * as SecureStore from 'expo-secure-store'
import * as WebBrowser from 'expo-web-browser'
import { URL } from 'react-native-url-polyfill'
import XMLRPCApi, { RSD_NOT_FOUND, BLOG_ID_NOT_FOUND, XML_ERROR } from '../api/XMLRPCApi'
import MicroPubApi, { MICROPUB_NOT_FOUND, FETCH_ERROR, NO_AUTH, AUTH_ERROR, UNSUPPORTED_PKCE } from '../api/MicroPubApi'
import Auth from './Auth'
import Tokens from './Tokens'
import App from './App'
import { blog_services } from './enums/blog_services'
import { createAuthorization } from '../utils/indieauth'

const AUTH_STORAGE_KEY = 'MicropubAuth'
const AUTH_LIFETIME = 10 * 60 * 1000

export default Services = types.model('Services', {
  is_setting_up: types.optional(types.boolean, false),
  pending_micropub_auth: types.maybeNull(types.frozen()),
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
    yield self.clear_micropub_authorization()
    self.current_username = user?.username
    if(!user?.posting?.selected_service?.is_microblog){
      self.current_url = user.posting?.selected_service?.name // I know, bad property name
      self.did_set_up_successfully = true
    }
    else if(user?.posting?.first_custom_service()?.name){
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
    yield self.clear_micropub_authorization()
    self.current_url = ""
    self.xml_endpoint = ""
    self.micropub_endpoint = ""
    self.auth_endpoint = ""
    self.token_endpoint = ""
    self.blog_id = ""
    self.show_credentials = false
    self.did_set_up_successfully = false
  }),
  
  clear_micropub_authorization: flow(function* () {
    self.pending_micropub_auth = null
    yield SecureStore.deleteItemAsync(AUTH_STORAGE_KEY)
  }),

  set_url: flow(function* (text) {
    if (text !== self.current_url && self.pending_micropub_auth) {
      yield self.clear_micropub_authorization()
    }
    if(text !== self.current_url && self.show_credentials){
      self.show_credentials = false
    }
    self.current_url = text
  }),
  
  setup_new_service: flow(function* () {
    if (self.is_setting_up || self.checking_credentials) {
      return
    }
    self.is_setting_up = true
    try {
      yield self.clear_micropub_authorization()
      const blog_url = self.current_url
      const username = self.current_username
      // Assume HTTPS if no scheme.
      const discover_url = blog_url.includes('http') ? blog_url : `https://${blog_url}`
      let discovery_url
      try {
        discovery_url = new URL(discover_url)
      }
      catch (error) {
        Alert.alert('Invalid URL', 'Please enter a valid URL for your weblog.')
        return
      }
      const me = discovery_url.href
      discovery_url.searchParams.set('v', App.now().toString())
      const endpoints = yield MicroPubApi.discover_micropub_endpoints(discovery_url.href)
      if (endpoints === AUTH_ERROR || endpoints === UNSUPPORTED_PKCE) {
        Alert.alert('Unable to Authorize', endpoints === UNSUPPORTED_PKCE ?
          'This server’s authorization method is not supported by Micro.blog.' : 'We could not discover how to authorize with this server. Please try again.')
        return
      }
      if (endpoints !== MICROPUB_NOT_FOUND && !endpoints.is_wordpress) {
        self.micropub_endpoint = endpoints.micropub
        self.auth_endpoint = endpoints.auth
        self.token_endpoint = endpoints.token
        const authorization = {
          ...(yield createAuthorization(endpoints.supports_pkce)),
          me,
          profile_url: endpoints.me,
          blog_url,
          username,
          micropub_endpoint: endpoints.micropub,
          auth_endpoint: endpoints.auth,
          token_endpoint: endpoints.token,
          issuer: endpoints.issuer,
          requires_issuer: endpoints.requires_issuer,
          expires_at: Date.now() + AUTH_LIFETIME
        }
        yield SecureStore.setItemAsync(AUTH_STORAGE_KEY, JSON.stringify(authorization))
        self.pending_micropub_auth = authorization
        const auth_url = MicroPubApi.make_auth_url(me, endpoints.auth, authorization)
        const result = yield WebBrowser.openAuthSessionAsync(auth_url, 'microblog://indieauth')
        if (result?.type === 'success' && self.pending_micropub_auth?.state === authorization.state) {
          yield self.check_micropub_credentials_and_proceed_setup(result.url)
        }
        if (self.pending_micropub_auth?.state === authorization.state) {
          yield self.clear_micropub_authorization()
        }
      }
      else {
        const rsd_link = yield XMLRPCApi.discover_rsd_endpoint(discovery_url.href)
        if (rsd_link !== RSD_NOT_FOUND) {
          const blog_info = yield XMLRPCApi.discover_preferred_blog(rsd_link)
          if (blog_info !== BLOG_ID_NOT_FOUND) {
            self.blog_id = blog_info.blog_id
            self.xml_endpoint = blog_info.xmlrpc_url
            self.show_credentials = true
          }
        }
        else {
          Alert.alert('Sorry, we could not find the XML-RPC endpoint or Micropub API for your weblog.')
        }
      }
    }
    catch (error) {
      yield self.clear_micropub_authorization()
      Alert.alert('Unable to Authorize', 'We could not open authorization for your weblog. Please try again.')
    }
    finally {
      self.is_setting_up = false
    }
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
            const config_is_set_up = yield service.set_initial_config()
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
    self.checking_credentials = false
  }),
  
  check_micropub_credentials_and_proceed_setup: flow(function* (url) {
    if (self.checking_credentials || !MicroPubApi.is_auth_callback(url)) {
      return false
    }
    self.checking_credentials = true
    try {
      const saved = self.pending_micropub_auth || JSON.parse((yield SecureStore.getItemAsync(AUTH_STORAGE_KEY)) || 'null')
      if (!saved) {
        return false
      }
      if (saved.expires_at <= Date.now() || saved.username !== Auth.selected_user?.username) {
        yield self.clear_micropub_authorization()
        Alert.alert('Unable to Authorize', 'This authorization has expired or the account has changed. Please try again.')
        return false
      }
      const callback = new URL(url)
      if (callback.searchParams.get('state') !== saved.state) {
        Alert.alert('Unable to Authorize', 'We could not verify this authorization. Please try again.')
        return false
      }
      // Consume the attempt before exchanging so duplicate callbacks cannot use it.
      yield self.clear_micropub_authorization()
      if (callback.searchParams.get('error') === 'access_denied') {
        return false
      }
      const data = yield MicroPubApi.verify_code(saved, url)
      if (data === NO_AUTH || data === FETCH_ERROR || !(yield MicroPubApi.verify_profile(saved, data.me))) {
        Alert.alert('Unable to Authorize', 'We could not verify authorization for your weblog. Please try again.')
        return false
      }
      const service_object = { endpoint: saved.micropub_endpoint, token: data.access_token }
      const config = yield MicroPubApi.get_config(service_object)
      const user = Auth.user_from_username(saved.username)
      if (config === FETCH_ERROR || !user?.posting || Auth.selected_user?.username !== saved.username) {
        return false
      }
      const service = yield user.posting.create_new_service(blog_services.micropub, saved.blog_url, saved.micropub_endpoint, saved.username)
      if (!service) {
        return false
      }
      const token = yield Tokens.create_new_service_token(saved.username, data.access_token, service.id)
      if (!token || !(yield service.set_initial_config(config))) {
        return false
      }
      if (!(yield user.posting.activate_new_service(service))) {
        return false
      }
      self.current_url = saved.blog_url
      self.current_username = saved.username
      self.micropub_endpoint = saved.micropub_endpoint
      self.auth_endpoint = saved.auth_endpoint
      self.token_endpoint = saved.token_endpoint
      self.did_set_up_successfully = true
      return true
    }
    catch (error) {
      console.log('Micropub authorization failed')
      yield self.clear_micropub_authorization()
      Alert.alert('Unable to Authorize', 'Something went wrong setting up your weblog. Please try again.')
      return false
    }
    finally {
      self.checking_credentials = false
    }
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
  
  trigger_custom_service_delete: flow(function* () {
    Alert.alert(
      "Remove blog?",
      "Are you sure you want to remove this blog?",
      [
        {
          text: "Cancel",
          style: 'cancel',
        },
        {
          text: "Remove",
          onPress: () => self.remove_custom_service(),
          style: 'destructive'
        },
      ],
      {cancelable: false},
    );
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
  can_handle_open_url(url) {
    return MicroPubApi.is_auth_callback(url)
  },
  
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
  },
  
  show_loading(){
    return self.checking_credentials || self.is_setting_up
  }
  
}))
.create({})
