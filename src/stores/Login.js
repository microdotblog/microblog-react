import { flow, types } from 'mobx-state-tree';
import MicroBlogApi, { LOGIN_SUCCESS, LOGIN_ERROR, LOGIN_INCORRECT, LOGIN_TOKEN_INVALID } from './../api/MicroBlogApi';
import StringChecker from './../utils/string_checker';

export default Login = types.model('Login', {
  input_value: types.optional(types.string, ""),
  is_loading: types.optional(types.boolean, false)
})
.actions(self => ({
  
  set_input_value: flow(function* (value) {
    console.log("LOGIN:set_input_value", value)
    self.input_value = value
  }),
  
  trigger_login: flow(function* () {
    console.log("LOGIN:trigger_login", self)
    self.is_loading = true
    if(self.can_submit()){
      if(self.is_valid_email_address()){
        console.log("LOGIN:trigger_login:email_login")
        yield self.login_with_email()
      }
      else if(self.is_valid_token()){
        console.log("LOGIN:trigger_login:token_login")
      }
    }
    self.is_loading = false
    
  }),
  
  login_with_email: flow(function* () {
    const login = yield MicroBlogApi.login_with_email(self.input_value)
    console.log("LOGIN:trigger_login:email_login:login", login)
  })
  
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