import { flow, types, applySnapshot } from 'mobx-state-tree'
import * as WebBrowser from 'expo-web-browser'
import MicroBlogApi, { LOGIN_SUCCESS, LOGIN_ERROR, LOGIN_INCORRECT, LOGIN_TOKEN_INVALID, APPLE_USERNAME_REQUIRED } from './../api/MicroBlogApi'
import {
  build_micro_blog_auth_url,
  create_oauth_state,
  exchange_micro_blog_code,
  extract_micro_blog_callback_params,
  extract_signin_token,
  get_micro_blog_redirect_uri,
  is_micro_blog_callback_url,
  is_signin_token_url,
} from './../api/MicroBlogAuth'
import StringChecker from './../utils/string_checker'
import { Alert, Platform } from 'react-native'
import Auth from './Auth'
import App from './App'

const Login = types.model('Login', {
  input_value: types.optional(types.string, ""),
  is_loading: types.optional(types.boolean, false),
  message: types.maybeNull(types.string),
  show_error: types.optional(types.boolean, false),
  error_message: types.maybeNull(types.string),
  did_trigger_login_from_url: types.optional(types.boolean, false),
  pending_oauth_state: types.maybeNull(types.string),
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

  reset_apple_credentials() {
    self.apple_user_id = null
    self.apple_identity_token = null
    self.apple_email = null
    self.apple_full_name = null
    self.apple_username = ""
  },

  clear_error() {
    self.show_error = false
    self.error_message = null
  },

  set_error(message = null) {
    self.show_error = !!message
    self.error_message = message
  },

  can_handle_open_url(raw_url = '') {
    return is_micro_blog_callback_url(raw_url) || is_signin_token_url(raw_url)
  },

  handle_open_url: flow(function* (raw_url = '') {
    if (is_signin_token_url(raw_url)) {
      const token = extract_signin_token(raw_url)
      self.pending_oauth_state = null
      return yield self.login_with_token(true, token)
    }

    if (!is_micro_blog_callback_url(raw_url)) {
      return false
    }

    if (!self.pending_oauth_state) {
      return false
    }

    return yield self.complete_sign_in_callback(raw_url)
  }),

  trigger_login_from_url: flow(function* (url) {
    console.log("LOGIN:trigger_login_from_url")
    self.did_trigger_login_from_url = true
    const did_handle = yield self.handle_open_url(url)
    App.close_sheet("login-message-sheet").catch(() => {})
    return did_handle
  }),

  sign_in_with_micro_blog: flow(function* () {
    if (self.is_loading) {
      return false
    }

    self.clear_error()
    self.is_loading = true
    self.message = null

    try {
      const oauth_state = create_oauth_state()
      if (!oauth_state) {
        self.set_error('We could not prepare Micro.blog sign in. Please try again.')
        return false
      }

      self.pending_oauth_state = oauth_state

      const redirect_uri = get_micro_blog_redirect_uri()
      const auth_url = build_micro_blog_auth_url({
        redirect_uri,
        state: oauth_state,
      })
      const auth_result = yield WebBrowser.openAuthSessionAsync(auth_url, redirect_uri)

      if (auth_result?.type === 'success' && auth_result?.url) {
        const did_handle_callback = yield self.handle_open_url(auth_result.url)

        if (did_handle_callback) {
          return true
        }

        self.pending_oauth_state = null
        if (!self.show_error) {
          self.set_error('Micro.blog sign in did not complete. Please try again.')
        }
        return false
      }

      self.pending_oauth_state = null

      if (auth_result?.type === 'cancel' || auth_result?.type === 'dismiss') {
        self.clear_error()
      }
      else {
        self.set_error('Micro.blog sign in did not complete. Please try again.')
      }

      return false
    }
    catch (error) {
      console.log("LOGIN:sign_in_with_micro_blog:error", error)
      self.pending_oauth_state = null
      self.set_error('We could not open Micro.blog sign in. Please try again.')
      return false
    }
    finally {
      self.is_loading = false
    }
  }),

  complete_sign_in_callback: flow(function* (raw_url = '') {
    const { code, state } = extract_micro_blog_callback_params(raw_url)
    const expected_state = self.pending_oauth_state

    self.pending_oauth_state = null

    if (!code) {
      self.set_error('Micro.blog did not return an authorization code. Please try again.')
      return false
    }

    if (!state || !expected_state || state !== expected_state) {
      self.set_error('Micro.blog sign in could not be verified. Please try again.')
      return false
    }

    try {
      const token_payload = yield exchange_micro_blog_code({ code })
      const access_token = `${token_payload?.access_token || ''}`.trim()

      if (!access_token) {
        self.set_error('Micro.blog did not return an access token. Please try again.')
        return false
      }

      return yield self.login_with_token(true, access_token)
    }
    catch (error) {
      console.log("LOGIN:complete_sign_in_callback:error", error)
      self.set_error('We could not finish signing you in. Please try again.')
      return false
    }
  }),
  
  submit_email_or_token: flow(function* (reset_navigation = false) {
    if (self.is_loading || !self.can_submit_credentials()) {
      return false
    }

    if (self.is_valid_email_address()) {
      return yield self.login_with_email()
    }

    if (self.is_valid_token()) {
      return yield self.login_with_token(reset_navigation, self.input_value)
    }

    self.set_error('Enter a valid email address or app token.')
    return false
  }),

  login_with_email: flow(function* (email = self.input_value) {
    const trimmed_email = `${email || ''}`.trim()
    if (!StringChecker._validate_email(trimmed_email)) {
      self.set_error('Enter a valid email address.')
      return false
    }

    self.is_loading = true
    self.message = null
    self.clear_error()

    try {
      const login = yield MicroBlogApi.login_with_email(trimmed_email)
      console.log("LOGIN:login_with_email:login", login)
      if (login === LOGIN_SUCCESS) {
        self.message = `Email sent! Check your email on this device and tap the "Open in Micro.blog for ${Platform.OS === 'ios' ? "iOS" : "Android"}" button.`
        App.open_sheet("login-message-sheet")
        return true
      }
      else if (login === LOGIN_INCORRECT) {
        self.set_error("Your sign in details were incorrect. Please double check and try again.")
        return false
      }
      else {
        self.set_error("An error occured whilst trying to sign you in. Please try again.")
        return false
      }
    }
    catch (error) {
      console.log("LOGIN:login_with_email:error", error)
      self.set_error("An error occured whilst trying to sign you in. Please try again.")
      return false
    }
    finally {
      self.is_loading = false
    }
  }),
  
  login_with_token: flow(function* (reset_navigation = false, token = self.input_value) {
    const trimmed_token = `${token || ''}`.trim()
    if (!trimmed_token) {
      self.set_error('Enter a Micro.blog token to sign in.')
      return false
    }

    self.is_loading = true
    self.message = null
    self.clear_error()

    try {
      const login = yield MicroBlogApi.login_with_token(trimmed_token)
      console.log("LOGIN:login_with_token:login", login)
      if(login !== LOGIN_ERROR && login !== LOGIN_TOKEN_INVALID){
        console.log("LOGIN:login_with_token:SUCCESS")
        yield self.finish_login_with_data(login, reset_navigation)
        return true
      }
      else if(login === LOGIN_TOKEN_INVALID){
        self.set_error("That Micro.blog token is not valid. Please try again.")
        return false
      }
      else{
        self.set_error("We could not sign you in with that token. Please try again.")
        return false
      }
    }
    finally {
      self.is_loading = false
    }
  }),

  login_with_apple_credentials: flow(function* ({ user_id, identity_token, email = "", full_name = "" }) {
    console.log("LOGIN:login_with_apple_credentials", user_id)
    self.reset_apple_credentials()
    self.is_loading = true
    self.message = null
    self.clear_error()

    self.apple_user_id = user_id || null
    self.apple_identity_token = identity_token || null
    self.apple_email = email || ""
    self.apple_full_name = full_name || ""

    if(self.apple_user_id == null || self.apple_identity_token == null){
      self.set_error("An error occured whilst trying to sign you in with Apple. Please try again.")
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
    if(self.is_loading || !self.can_submit_apple_username()){
      return false
    }

    self.is_loading = true
    self.message = null
    self.clear_error()

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
      self.set_error(login.error)
      Alert.alert("Unable to sign in with Apple", self.error_message)
    }
    else if(login === APPLE_USERNAME_REQUIRED){
      App.navigate_to_screen("AppleUsername")
    }
    else if(login !== LOGIN_ERROR && login !== LOGIN_INCORRECT){
      yield self.finish_login_with_data(login, reset_navigation)
    }
    else if(login === LOGIN_INCORRECT){
      self.set_error("Your sign in details were incorrect. Please double check and try again.")
      Alert.alert("Wrong details", self.error_message)
    }
    else{
      self.set_error("An error occured whilst trying to sign you in with Apple. Please try again.")
      Alert.alert("Ooops", self.error_message)
    }
  }),

  finish_login_with_data: flow(function* (login, reset_navigation = false) {
    const was_already_logged_in = Auth.is_logged_in()
    const result = yield Auth.handle_new_login(login)
    if(result){
      yield App.bump_web_view_epoch()
      App.close_sheet("main_sheet").catch(() => {})
      if (was_already_logged_in) {
        const navigation = App.navigation()
        if(reset_navigation){
          yield App.reset_to_tabs()
        }
        else if(navigation?.canGoBack?.()){
          navigation.goBack()
        }
        else{
          navigation?.navigate?.("Tabs")
        }
      }
      self.reset()
    }
    else{
      self.set_error("An error occured whilst trying to sign you in. Please try again.")
      Alert.alert("Ooops", self.error_message)
    }
  }),
  
  reset_errors: flow(function* () {
    console.log("LOGIN:reset_errors")
    self.clear_error()
  }),
  
  reset: flow(function* () {
    console.log("LOGIN:reset_model")
    applySnapshot(self, {})
  }),
  
}))
.views(self => ({

  is_valid_email_address(){
    return StringChecker._validate_email(`${self.input_value || ''}`.trim())
  },

  is_valid_token(){
    return StringChecker._validate_is_token(`${self.input_value || ''}`.trim())
  },

  can_submit_credentials(){
    return !self.is_loading && (this.is_valid_email_address() || this.is_valid_token())
  },

  submit_button_label(){
    if (self.is_loading) {
      if (this.is_valid_email_address()) {
        return 'Sending email...'
      }
      if (this.is_valid_token()) {
        return 'Checking token...'
      }
      return 'Signing in...'
    }

    if (this.is_valid_token()) {
      return 'Sign in with token'
    }

    if (this.is_valid_email_address()) {
      return 'Continue'
    }

    return 'Continue'
  },

  can_submit_apple_username(){
    return !self.is_loading &&
      self.apple_user_id != null &&
      self.apple_identity_token != null &&
      self.apple_username != null &&
      self.apple_username.length > 0
  }
  
}))
.create();

export default Login
