import { flow, types } from 'mobx-state-tree';
import MicroBlogApi, { LOGIN_SUCCESS, LOGIN_ERROR, LOGIN_INCORRECT, LOGIN_TOKEN_INVALID } from './../api/MicroBlogApi';
import StringChecker from './../utils/string_checker';
import { Alert } from 'react-native';

export default Login = types.model('Login', {
  input_value: types.optional(types.string, ""),
  is_loading: types.optional(types.boolean, false),
  message: types.maybeNull(types.string),
  show_error: types.optional(types.boolean, false),
  error_message: types.maybeNull(types.string)
})
.actions(self => ({
  
  set_input_value: flow(function* (value) {
    console.log("LOGIN:set_input_value", value)
    self.input_value = value
    if(self.show_error){
      self.reset_errors()
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
      self.message = 'Email sent! Check your email on this device and tap the "Open in Micro.blog for Android" button.'
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
  
  reset_errors: flow(function* () {
    console.log("LOGIN:reset_errors")
    self.show_error = false
    self.error_message = null
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
  }
  
}))
.create();