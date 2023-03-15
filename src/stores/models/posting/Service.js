import { types, flow } from 'mobx-state-tree';
import Tokens from './../../Tokens';
import MicroPubApi, { DELETE_ERROR } from './../../../api/MicroPubApi';
import Config from './Config';
import { Alert } from 'react-native';

export default Service = types.model('Service', {
  id: types.identifier,
  name: types.maybeNull(types.string),
  url: types.maybeNull(types.string),
  type: types.maybeNull(types.string),
  username: types.maybeNull(types.string),
  is_microblog: types.optional(types.boolean, false),
  config: types.maybeNull(Config),
  is_loading_posts: types.optional(types.boolean, false)
})
.actions(self => ({

  hydrate: flow(function* () {
    console.log("Endpoint:hydrate", self.id)
    if(self.is_microblog){
      const config = yield MicroPubApi.get_config(self.service_object())
      console.log("Endpoint:hydrate:config", config)
      if(config){
        self.config = config
        self.config.hydrate_default_destination()
        self.check_for_categories()
      }
    }
  }),
  
  afterCreate: flow(function* () {
    self.hydrate()
  }),

  check_for_categories: flow(function* () { 
    if(self.config?.destination != null && self.config.destination.length > 0){
      self.config.destination.forEach(async (destination) => {
        // TODO: Perhaps check if we already have categories downloaded before fetching,
        // as we download them on demand when opening the new post screen.
        console.log("Endpoint:check_for_categories", destination.uid)
        const data = await MicroPubApi.get_categories(self.service_object(), destination.uid)
        console.log("Endpoint:check_for_categories:categories", data)
        if(data?.categories != null && data.categories.length > 0){
          destination.set_categories(data.categories)
        }
      })
    }
  }),
  
  check_for_posts: flow(function* () { 
    if(self.config?.destination != null && self.config.destination.length > 0){
      self.config.destination.forEach((destination) => {
        self.check_for_posts_for_destination(destination)
      })
    }
  }),
  
  check_for_posts_for_destination: flow(function* (destination) { 
    if(destination){
      self.is_loading_posts = true
      console.log("Endpoint:check_for_posts_for_destination", destination.uid)
      const data = yield MicroPubApi.get_posts(self.service_object(), destination.uid)
      console.log("Endpoint:check_for_posts_for_destination:posts", data?.items?.length)
      if(data?.items != null && data.items?.length > 0){
        destination.set_posts(data.items)
      }
      self.is_loading_posts = false
    }
  }),
  
  upate_posts_for_active_posts_destination: flow(function* () {
    const active_destination = self.config.posts_destination()
    if(active_destination){
      self.check_for_posts_for_destination(active_destination)
    }
  }),
  
  set_active_destination: flow(function* (destination, type = null) { 
    if(destination){
      self.config.set_selected_posts_destination(destination)
      if(type !== null && type === "posts"){
        self.check_for_posts_for_destination(destination)
      }
    }
  }),
  
  trigger_post_delete(post) {
    console.log("Destination:trigger_post_delete", post)
    Alert.alert(
      "Delete post?",
      "Are you sure you want to delete this post?",
      [
        {
          text: "Cancel",
          style: 'cancel',
        },
        {
          text: "Delete",
          onPress: () => self.delete_post(post),
          style: 'destructive'
        },
      ],
      {cancelable: false},
    )
  },
  
  delete_post: flow(function* (post) {
    console.log("Destination:delete_post", post)
    const status = yield MicroPubApi.delete_post(self.service_object(), post.url)
    if(status !== DELETE_ERROR){
      App.show_toast("Post was deleted.")
      self.upate_posts_for_active_posts_destination()
    }
    else{
      Alert.alert("Whoops", "Could not delete post. Please try again.")
    }
  }),

  publish_draft: flow(function* (post) {
    console.log("Destination:publish_draft", post)
    const status = yield MicroPubApi.publish_draft(self.service_object(), post.content, post.url, post.name)
    if(status !== DELETE_ERROR){
      App.show_toast("Post was published.")
      self.upate_posts_for_active_posts_destination()
    }
    else{
      Alert.alert("Error Publishing", "Could not publish the draft. Please try again.")
    }
  })
  
}))
.views(self => ({
  
  credentials() {
    return self.name != null && self.name === "Micro.blog" && self.username != null && self.is_microblog ? Tokens.token_for_username(self.username) : null
  },
  
  service_object(){
    return {
      endpoint: self.url,
      username: self.username,
      token: this.credentials()?.token,
      destination: self.config?.active_destination()?.uid,
      media_endpoint: self.config?.media_endpoint()
    }
  }
  
}))