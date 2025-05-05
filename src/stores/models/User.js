import { types, flow } from 'mobx-state-tree';
import Tokens from './../Tokens';
import Posting from './Posting';
import FastImage from 'react-native-fast-image';
import Muting from './Muting'
import Push from '../Push'
import App from '../App'
import MicroBlogApi, { API_ERROR, LOGIN_TOKEN_INVALID } from '../../api/MicroBlogApi';

export default User = types.model('User', {
    username: types.identifier,
    avatar: types.maybeNull(types.string),
    has_site: types.maybeNull(types.boolean, false),
    default_site: types.maybeNull(types.string),
    full_name: types.maybeNull(types.string),
    posting: types.maybeNull(Posting),
    muting: types.maybeNull(Muting),
    push_enabled: types.optional(types.boolean, false),
    toggling_push: types.optional(types.boolean, false),
    bookmark_tags: types.optional(types.array(types.string), []),
    bookmark_recent_tags: types.optional(types.array(types.string), []),
    selected_tag: types.maybeNull(types.string),
    bookmark_tag_filter_query: types.maybeNull(types.string),
    temporary_tags_for_bookmark: types.optional(types.array(types.string), []),// We'll use this to set the temporary bookmarks for a given bookmark.
    is_fetching_tags_for_bookmark: types.optional(types.boolean, false),
    is_updating_tags_for_bookmark: types.optional(types.boolean, false),
    temporary_bookmark_id: types.maybeNull(types.string),
    is_premium: types.maybeNull(types.boolean),
    is_using_ai: types.maybeNull(types.boolean)
  })
  .actions(self => ({

    hydrate: flow(function* () {
      console.log("User:hydrate", self.username)
      self.check_token_validity()
      if(self.avatar){
        FastImage.preload([{uri: self.avatar}])
      }
      if(self.posting == null){
        self.posting = Posting.create({username: self.username})
      }
      else {
        self.posting.hydrate()
      }
      if (!App.is_share_extension) {
        
        if (self.muting == null) {
          self.muting = Muting.create({username: self.username})
        }
        else {
          self.muting.hydrate()
        }
        
        self.get_push_info()
        
        self.update_avatar()
        self.fetch_tags()
        self.fetch_recent_tags()
        self.selected_tag = null
        self.is_fetching_tags_for_bookmark = false
        self.temporary_tags_for_bookmark = []
        self.is_updating_tags_for_bookmark = false
        self.temporary_bookmark_id = null
      }
      self.toggling_push = false
    }),
    
    afterCreate: flow(function* () {
      self.hydrate()
    }),
    
    check_token_validity: flow(function* () {
      const token_validity = yield MicroBlogApi.login_with_token(self.token())
      if(token_validity === LOGIN_TOKEN_INVALID){
        console.log("User:TOKEN_IS_INVALID")
        App.trigger_logout_for_user(self)
      }
    }),
    
    toggle_push_notifications: flow(function* () {
      self.toggling_push = true
      if (!self.is_registered_for_push()) {
        yield self.register_for_push()
      }
      else {
        yield self.unregister_for_push()
      }
      self.toggling_push = false
    }),
    
    register_for_push: flow(function* () {
      const registered = yield Push.register_token(self.token())
      if (registered) {
        self.push_enabled = true
        self.get_push_info()
        return true
      }
      else {
        self.push_enabled = false
        self.get_push_info()
        return false
      }
    }),
    
    unregister_for_push: flow(function* () {
      const did_unregister = yield Push.unregister_user_from_push(self.token())
      if (did_unregister) {
        self.push_enabled = false
        self.get_push_info()
        return true
      }
      else {
        self.get_push_info()
        return false
      }
    }),
    
    get_push_info: flow(function* () {
  		console.log("User::get_push_info")
  		const data = yield MicroBlogApi.get_push_info(self.token())
  		if (data !== API_ERROR) {
  		  console.log("User::get_push_info:data", data)
  			if(data.length > 0){
  			  Push.set_devices_for_user(self.username, data)
  			}
  		}
  	}),

    fetch_data: flow(function* () {
      console.log("User:fetch_data", self.username)
      if(self.posting == null){
        self.posting = Posting.create({username: self.username})
      }
      else {
        self.posting.hydrate()
      }
    }),
    
    update_avatar: flow(function* () {
      const user_data = yield MicroBlogApi.login_with_token(self.token())
      if(user_data && user_data?.avatar){
        self.avatar = user_data.avatar
      }
    }),
    
    fetch_tags: flow(function* () {
      console.log("User:fetch_tags")
      App.set_is_loading_highlights(true)
      const tags = yield MicroBlogApi.bookmark_tags()
      console.log("User:fetch_tags:tags", tags)
      if(tags !== API_ERROR && tags != null){
        self.bookmark_tags = tags
      }
      App.set_is_loading_highlights(false)
      console.log("User:fetch_tags:count", self.bookmark_tags.length)
    }),
    
    fetch_recent_tags: flow(function* () {
      console.log("User:fetch_recent_tags")
      const tags = yield MicroBlogApi.bookmark_recent_tags(5)
      console.log("User:fetch_recent_tags:tags", tags)
      if(tags !== API_ERROR && tags != null){
        self.bookmark_recent_tags = tags
      }
      console.log("User:fetch_recent_tags:count", self.bookmark_recent_tags.length)
    }),
    
    set_selected_tag: flow(function* (tag = null) {
      console.log("User:set_selected_tag", tag)
      self.selected_tag = tag
      if(tag == null){
        self.set_bookmark_tag_filter_query(null)
      }
    }),
    
    set_bookmark_tag_filter_query: flow(function* (query = "") {
      console.log("User:set_bookmark_tag_filter_query", query)
      self.bookmark_tag_filter_query = query
    }),
    
    fetch_tags_for_bookmark: flow(function* (id) {
      console.log("User:fetch_tags_for_bookmark", id)
      self.is_fetching_tags_for_bookmark = true
      self.temporary_bookmark_id = id
      const data = yield MicroBlogApi.bookmark_by_id(id)
      console.log("User:fetch_tags_for_bookmark:data", data)
      if(data !== API_ERROR && data.items[0] != null){
        self.temporary_tags_for_bookmark = self.tags_to_array(data.items[0].tags)
      }
      console.log("User:temporary_tags_for_bookmark:array", self.temporary_tags_for_bookmark)
      self.is_fetching_tags_for_bookmark = false
    }),
    
    set_selected_temp_tag: flow(function* (tag) {
      console.log("User:set_selected_temp_tag", tag)
      const existing_tag = self.temporary_tags_for_bookmark.find(t => t === tag)
      if(existing_tag == null){
        self.temporary_tags_for_bookmark.push(tag)
      }
    }),
    
    delete_selected_temp_tag: flow(function* (tag) {
      console.log("User:delete_selected_temp_tag", tag)
      const existing_tag_index = self.temporary_tags_for_bookmark.findIndex(t => t === tag)
      if(existing_tag_index > -1){
        self.temporary_tags_for_bookmark.splice(existing_tag_index, 1)
      }
    }),
    
    set_selected_temp_tag_from_input: flow(function* () {
      console.log("User:set_selected_temp_tag_from_input", self.bookmark_tag_filter_query)
      const existing_tag = self.temporary_tags_for_bookmark.find(t => t === self.bookmark_tag_filter_query)
      if(existing_tag == null){
        self.temporary_tags_for_bookmark.push(self.bookmark_tag_filter_query)
        self.bookmark_tag_filter_query = null
      }
    }),
    
    clear_temporary_tags_for_bookmark: flow(function* () {
      self.temporary_tags_for_bookmark = []
      self.temporary_bookmark_id = null
    }),
    
    update_tags_for_bookmark: flow(function* () {
      console.log("User:update_tags_for_bookmark", self.temporary_bookmark_id)
      self.is_updating_tags_for_bookmark = true
      self.set_bookmark_tag_filter_query(null)
      const data = yield MicroBlogApi.save_tags_for_bookmark_by_id(self.temporary_bookmark_id, self.temporary_tags_for_bookmark.toString())
      if(data !== API_ERROR){
        App.set_is_loading_bookmarks(true)
        App.close_sheet("add_tags_sheet")
      }
      self.fetch_recent_tags()
      setTimeout(() => {
        App.set_is_loading_bookmarks(false)
      }, 200)
      self.is_updating_tags_for_bookmark = false
    }),
    
    check_user_is_premium: flow(function* () {
      const data = yield MicroBlogApi.login_with_token(self.token())
      if(data !== LOGIN_TOKEN_INVALID){
        console.log("User:check_user_is_premium / AI", data.is_premium, data.is_using_ai)
        self.is_premium = data.is_premium
        self.is_using_ai = data.is_using_ai
      }
    }),
    
  }))
  .views(self => ({
    
    token(){
      return Tokens.token_for_username(self.username, "user")?.token
    },
    
    filtered_tags(){
      return self.bookmark_tag_filter_query != null && self.bookmark_tag_filter_query != "" && self.bookmark_tags.length > 0 ? self.bookmark_tags.filter(tag => tag.includes(self.bookmark_tag_filter_query)) : self.bookmark_tags
    },
    
    tags_to_array(tags){
      return tags !== "" ? tags.split(", ") : []
    },
    
    is_registered_for_push(){
      return Push.is_registered_device_for_user(self.username) && self.push_enabled
    }
    
  }))
