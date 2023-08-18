import { types, flow } from 'mobx-state-tree';
import Tokens from './../Tokens';
import Posting from './Posting';
import FastImage from 'react-native-fast-image';
import Muting from './Muting'
import Push from '../Push'
import App from '../App'
import MicroBlogApi, { API_ERROR, DELETE_ERROR } from '../../api/MicroBlogApi';
import Highlight from './Highlight';

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
    did_complete_auto_register_push: types.optional(types.boolean, false),
    bookmark_highlights: types.optional(types.array(Highlight), []),
    bookmark_tags: types.optional(types.array(types.string), [])
  })
  .actions(self => ({

    hydrate: flow(function* () {
      console.log("HYDRATING USER", self.username)
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
        if(!self.did_complete_auto_register_push){
          self.push_enabled = yield Push.register_token(self.token())
          if(self.push_enabled){
            self.did_complete_auto_register_push = true
          }
        }
        self.update_avatar()
        self.fetch_highlights()
        self.fetch_tags()
      }
      self.toggling_push = false
    }),
    
    afterCreate: flow(function* () {
      self.hydrate()
    }),
    
    toggle_push_notifications: flow(function* () {
      self.toggling_push = true
      !self.push_enabled ? yield self.register_for_push() : yield self.unregister_for_push()
      self.toggling_push = false
    }),
    
    register_for_push: flow(function* () {
      self.push_enabled = yield Push.register_token(self.token())
    }),
    
    unregister_for_push: flow(function* () {
      let did_unregister = yield Push.unregister_user_from_push(self.token())
      self.push_enabled = !did_unregister
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
    
    fetch_highlights: flow(function* () {
      console.log("User:fetch_highlights")
      App.set_is_loading_highlights(true)
      const highlights = yield MicroBlogApi.bookmark_highlights()
      if(highlights !== API_ERROR && highlights.items){
        self.bookmark_highlights = highlights.items
      }
      App.set_is_loading_highlights(false)
      console.log("User:fetch_highlights:count", self.bookmark_highlights.length)
    }),
    
    delete_highlight: flow(function* (highlight_id) {
      console.log("User:delete_highlight", highlight_id)
      App.set_is_loading_highlights(true)
      const deleted = yield MicroBlogApi.delete_highlight(highlight_id)
      if(deleted !== DELETE_ERROR){
        self.fetch_highlights()
      }
      App.set_is_loading_highlights(false)
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
    })
    
  }))
  .views(self => ({
    
    token(){
      return Tokens.token_for_username(self.username)?.token
    }
    
  }))
