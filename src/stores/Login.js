import { flow, types, applySnapshot } from 'mobx-state-tree';
import MicroBlogApi, { LOGIN_SUCCESS, LOGIN_ERROR, LOGIN_INCORRECT, LOGIN_TOKEN_INVALID, APPLE_USERNAME_REQUIRED } from './../api/MicroBlogApi';
import StringChecker from './../utils/string_checker';
import { Alert, Platform } from 'react-native';
import Auth from './Auth';
import App from './App';

const Login = types.model('Login', {
  input_value: types.optional(types.string, ""),
  is_loading: types.optional(types.boolean, false),
  message: types.maybeNull(types.string),
  show_error: types.optional(types.boolean, false),
  error_message: types.maybeNull(types.string),
  did_trigger_login_from_url: types.optional(types.boolean, false),
  apple_user_id: types.maybeNull(types.string),
  apple_identity_token: types.maybeNull(types.string),
  apple_email: types.maybeNull(types.string),
  apple_full_name: types.maybeNull(types.string),
  apple_username: types.optional(types.string, "")
})
.actions(self => ({
  
  set_input_value: flow(function* (value) {
    self.input_value = value
    if(self.show_error){
      self.reset_errors()
    }
  }),

  set_apple_username: flow(function* (value) {
    self.apple_username = value
    if(self.show_error){
      self.reset_errors()
    }
  }),
  
  trigger_login_from_url: flow(function* (url) {
    console.log("LOGIN:trigger_login_from_url", url)
    const token = url.split('/signin/')[1]
    if(token){
      console.log("LOGIN:trigger_login_from_url:token", token)
      self.did_trigger_login_from_url = true
      self.input_value = token
      self.trigger_login()
      App.close_sheet("login-message-sheet")
    }
  }),
  
  trigger_login: flow(function* () {
    console.log("LOGIN:trigger_login", self)
    self.is_loading = true
    self.message = null
    
    if(self.show_error){
      self.reset_errors()
    }
    
    if(self.can_submit()){
      if(self.is_valid_email_address()){
        console.log("LOGIN:trigger_login:email_login")
        yield self.login_with_email()
      }
      else if(self.is_valid_token()){
        console.log("LOGIN:trigger_login:token_login")
        yield self.login_with_token()
      }
    }
    self.is_loading = false
    
  }),
  
  login_with_email: flow(function* () {
    const login = yield MicroBlogApi.login_with_email(self.input_value)
    console.log("LOGIN:trigger_login:email_login:login", login)
    if(login === LOGIN_SUCCESS){
      console.log("LOGIN:trigger_login:email_login:SUCCESS")
      self.message = `Email sent! Check your email on this device and tap the "Open in Micro.blog for ${Platform.OS === 'ios' ? "iOS" : "Android"}" button.`
      App.open_sheet("login-message-sheet")
    }
    else if(login === LOGIN_INCORRECT){
      self.show_error = true
      self.error_message = "Your sign in details were incorrect. Please double check and try again."
      Alert.alert("Wrong details", self.error_message)
    }
    else{
      self.show_error = true
      self.error_message = "An error occured whilst trying to sign you in. Please try again."
      Alert.alert("Ooops", self.error_message)
    }
  }),
  
  login_with_token: flow(function* () {
    const login = yield MicroBlogApi.login_with_token(self.input_value)
    console.log("LOGIN:trigger_login:login_with_token:login", login)
    if(login !== LOGIN_ERROR && login !== LOGIN_TOKEN_INVALID){
      console.log("LOGIN:trigger_login:login_with_token:login:SUCCESS")
      yield self.finish_login_with_data(login)
    }
    else if(login === LOGIN_TOKEN_INVALID){
      self.show_error = true
      self.error_message = "Your sign in details were incorrect. Please double check and try again."
      Alert.alert("Invalid token", self.error_message)
    }
    else{
      self.show_error = true
      self.error_message = "An error occured whilst trying to sign you in. Please try again."
      Alert.alert("Ooops", self.error_message)
    }
  }),

  login_with_apple_credentials: flow(function* ({ user_id, identity_token, email = "", full_name = "" }) {
    console.log("LOGIN:login_with_apple_credentials", user_id)
    self.is_loading = true
    self.message = null
    if(self.show_error){
      self.reset_errors()
    }

    self.apple_user_id = user_id || null
    self.apple_identity_token = identity_token || null
    self.apple_email = email || ""
    self.apple_full_name = full_name || ""

    if(self.apple_user_id == null || self.apple_identity_token == null){
      self.show_error = true
      self.error_message = "An error occured whilst trying to sign you in with Apple. Please try again."
      Alert.alert("Ooops", self.error_message)
      self.is_loading = false
      return false
    }

    const login = yield MicroBlogApi.login_with_apple({
      user_id: self.apple_user_id,
      identity_token: self.apple_identity_token,
      email: self.apple_email,
      full_name: self.apple_full_name
    })
    yield self.handle_apple_login_result(login)
    self.is_loading = false
  }),

  register_apple_username: flow(function* () {
    console.log("LOGIN:register_apple_username", self.apple_username)
    if(!self.can_submit_apple_username()){
      return false
    }

    self.is_loading = true
    self.message = null
    if(self.show_error){
      self.reset_errors()
    }

    const login = yield MicroBlogApi.login_with_apple({
      user_id: self.apple_user_id,
      identity_token: self.apple_identity_token,
      username: self.apple_username
    })
    yield self.handle_apple_login_result(login, true)
    self.is_loading = false
  }),

  handle_apple_login_result: flow(function* (login, reset_navigation = false) {
    console.log("LOGIN:handle_apple_login_result", login)
    if(login?.error != null){
      self.show_error = true
      self.error_message = login.error
      Alert.alert("Unable to sign in with Apple", self.error_message)
    }
    else if(login === APPLE_USERNAME_REQUIRED){
      App.navigate_to_screen("AppleUsername")
    }
    else if(login !== LOGIN_ERROR && login !== LOGIN_INCORRECT){
      yield self.finish_login_with_data(login, reset_navigation)
    }
    else if(login === LOGIN_INCORRECT){
      self.show_error = true
      self.error_message = "Your sign in details were incorrect. Please double check and try again."
      Alert.alert("Wrong details", self.error_message)
    }
    else{
      self.show_error = true
      self.error_message = "An error occured whilst trying to sign you in with Apple. Please try again."
      Alert.alert("Ooops", self.error_message)
    }
  }),

  finish_login_with_data: flow(function* (login, reset_navigation = false) {
    const result = yield Auth.handle_new_login(login)
    if(result){
      // THIS IS ALWAYS TRUE FOR NOW 😇
      App.close_sheet("main_sheet")
      if(reset_navigation && App.navigation().reset != null){
        App.navigation().reset({
          index: 0,
          routes: [{ name: "Tabs" }]
        })
      }
      else{
        App.navigation().goBack()
      }
      self.reset()
    }
    else{
      self.show_error = true
      self.error_message = "An error occured whilst trying to sign you in. Please try again."
      Alert.alert("Ooops", self.error_message)
    }
  }),
  
  reset_errors: flow(function* () {
    console.log("LOGIN:reset_errors")
    self.show_error = false
    self.error_message = null
  }),
  
  reset: flow(function* () {
    console.log("LOGIN:reset_model")
    applySnapshot(self, {})
  }),
  
}))
.views(self => ({
  
  is_valid_email_address(){
    return StringChecker._validate_email(self.input_value)
  },
  
  is_valid_token(){
    return StringChecker._validate_is_token(self.input_value)
  },
  
  credentials_seem_valid(){
    return this.is_valid_token() || this.is_valid_email_address()
  },
  
  can_submit(){
    return this.credentials_seem_valid() && self.input_value !== "" && self.input_value.length > 0
  },

  can_submit_apple_username(){
    return self.apple_user_id != null &&
      self.apple_identity_token != null &&
      self.apple_username != null &&
      self.apple_username.length > 0
  }
  
}))
.create();

export default Login
