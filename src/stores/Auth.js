import { types, flow, applySnapshot, destroy } from 'mobx-state-tree';
import { Keyboard, Platform } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import User from './models/User'
import Tokens from './Tokens'
import CookieManager from '@react-native-cookies/cookies';
import Push from './Push'
import { menuBottomSheet } from '../screens'
import Toast from 'react-native-simple-toast';

export default Auth = types.model('Auth', {
  users: types.optional(types.array(User), []),
  selected_user: types.maybeNull(types.reference(User)),
  is_selecting_user: types.optional(types.boolean, true),
  did_load_one_or_more_webviews: types.optional(types.boolean, false)
})
.actions(self => ({

  hydrate: flow(function* () {
    console.log("Auth:hydrate")
    yield Tokens.hydrate()
    const data = yield AsyncStorage.getItem('Auth')
    if (data) {
      yield Auth.clear_cookies()
      applySnapshot(self, JSON.parse(data))
      if(self.selected_user){
        self.is_selecting_user = false
      }
      console.log("Auth:hydrate:with_data")
    }
    else{
      console.log("Auth:hydrate:destroy_all_data")
      // It looks like we might no auth data,
      // so we should also try and clear any tokens we might have
      yield Tokens.destroy_all_token_data()
      yield AsyncStorage.clear()
      CookieManager.clearAll()
    }
    return self.is_logged_in()
  }),
  
  handle_new_login: flow(function* (data) {
    console.log("Auth:handle_new_login", data)
    if(data?.username != null && data?.token != null){
      const token = yield Tokens.add_new_token(data.username, data.token)
      console.log("Auth:handle_new_login:token", token)
      if(token && token.username === data?.username){
        yield self.create_and_select_new_user(data)
        Keyboard.dismiss()
        return true
      }
    }
    return false
  }),
  
  create_and_select_new_user: flow(function* (data) {
    console.log("Auth:create_and_select_new_user", data)
    const existing_user = self.users.find(u => u.username === data.username)
    yield Auth.clear_cookies()
    if(existing_user != null ){
      // TODO: JUST UPDATE THE USER AND SELECT
      self.selected_user = existing_user
      self.is_selecting_user = false
    }
    else{
      const new_user = User.create(data)
      self.users.push(new_user)
      self.selected_user = new_user
      self.is_selecting_user = false
    }
    console.log("Auth:create_and_select_new_user:users", self.users.length)
  }),
  
  select_user: flow(function* (user) {
    console.log("Auth:select_user", user)
    yield Auth.clear_cookies()
    self.selected_user = user
    if (self.selected_user.posting.selected_service != null) {
      user.posting.selected_service.hydrate()
      user.fetch_highlights()
      menuBottomSheet(true)
    }
    self.is_selecting_user = false
    setTimeout(() => {
      Toast.showWithGravity(`You're now logged in as @${user.username}`, Toast.SHORT, Toast.CENTER)
    }, Platform.OS === 'ios' ? 350 : 0)
    return
  }),
  
  logout_user: flow(function* (user = null) {
    console.log("Auth:logout_user", user)
    if (user == null) {
      user = self.selected_user
    }
    Push.unregister_user_from_push(user.token())
    Tokens.destroy_token(user.username)
    self.selected_user = null
    destroy(user)
    // TODO: Investigate if the clear_cookies has a direct impact to
    // the "token not found" web message...
    yield Auth.clear_cookies()
    if(self.users.length){
      self.selected_user = self.users[0]
      self.is_selecting_user = false
    }
    else{
      menuBottomSheet(true)
    }
  }),
  
  logout_all_user: flow(function* () {
    console.log("Auth:logout_all_users")
    yield Auth.clear_cookies()
    self.users.forEach((user) => {
      Push.unregister_user_from_push(user.token())
      Tokens.destroy_token(user.username)
      self.selected_user = null
      destroy(user)
    })
  }),
  
  clear_cookies: flow(function* () {
    console.log("Auth:clear_cookies")
    self.is_selecting_user = true
    self.did_load_one_or_more_webviews = false
    CookieManager.clearAll()
  }),

  set_did_load_one_or_more_webviews: flow(function* () {
    console.log("Auth:set_did_load_one_or_more_webviews")
    self.did_load_one_or_more_webviews = true
  }),
  
}))
.views(self => ({
  
  is_logged_in(){
    return self.users.length && self.selected_user != null && self.selected_user.token() != null
  },
  
  all_users_except_current(){
    return self.users.filter(u => u.username !== self.selected_user.username)
  },
  
  user_from_username(username){
    return self.users.find(u => u.username === username)
  }
  
}))
.create();