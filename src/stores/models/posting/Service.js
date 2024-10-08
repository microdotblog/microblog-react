import { types, flow, destroy } from 'mobx-state-tree'
import Tokens from './../../Tokens'
import MicroPubApi, { DELETE_ERROR, FETCH_ERROR } from './../../../api/MicroPubApi'
import XMLRPCApi, { XML_ERROR } from '../../../api/XMLRPCApi'
import Config from './Config'
import { Alert } from 'react-native'
import DocumentPicker from 'react-native-document-picker'
import { launchImageLibrary } from 'react-native-image-picker'
import App from '../../App'

export default Service = types.model('Service', {
  id: types.identifier,
  name: types.maybeNull(types.string),
  url: types.maybeNull(types.string),
  type: types.maybeNull(types.string),
  username: types.maybeNull(types.string),
  is_microblog: types.optional(types.boolean, false),
  config: types.maybeNull(Config),
  is_loading_posts: types.optional(types.boolean, false),
  is_loading_pages: types.optional(types.boolean, false),
  is_loading_uploads: types.optional(types.boolean, false),
  blog_id: types.maybeNull(types.string),
})
.actions(self => ({

  hydrate: flow(function* () {
    console.log("Service:hydrate", self.id)
    if(self.is_microblog || self.type === "micropub"){
      if(self.credentials()?.token == null){return}
      const config = yield MicroPubApi.get_config(self.service_object())
      console.log("Service:hydrate:micropub:config", config)
      if(config){
        // We need to check if config.destination exists, and if not, we need to create it.
        if(config.destination == null){
          config.destination = [
            {
              uid: self.name.includes("http://") || self.name.includes("https://") ? self.name : `https://${self.name}`,
              name: self.name
            }
          ]
        }
        // Before we set the new config, let's check if we had a config beforehand
        const previously_set_destination = self.config?.selected_posts_destination
        self.config = config        
        if(previously_set_destination != null){
          self.config.set_previously_selected_posts_destination(previously_set_destination)
        }
        else{
          self.config.hydrate_default_destination()
        }
        self.check_for_syndicate_to_targets()
        if(App.is_share_extension){
          self.check_for_categories()
        }
      }
    }
    else if(self.type === "xmlrpc" && self.credentials()?.token != null){
      console.log("Service:hydrate:xmlrpc")
      const categories = yield XMLRPCApi.get_config(self.service_object())
      console.log("Service:hydrate:xmlrpc:categories", categories)
      if (categories !== XML_ERROR) {
        // We need to iterate over categories and grab just the "categoryName" attributes for now. Not sure if we need ID data?
        const category_names = categories.map(category => category.categoryName)
        console.log("Service:hydrate:xmlrpc:categories:category_names", category_names)
        
        self.config = {
          "media-endpoint": self.url,
          destination: [{
            uid: self.name,
            name: self.name,
            categories: category_names
          }]
        }
        console.log("Service:set_initial_config:config", self.config)
      }
    }
  }),
  
  afterCreate: flow(function* () {
    self.hydrate()
  }),

  check_for_categories: flow(function* () { 
    if(self.config?.destination != null && self.config.destination.length > 0 && self.type !== "xmlrpc"){
      self.config.destination.forEach(async (destination) => {
        // TODO: Perhaps check if we already have categories downloaded before fetching,
        // as we download them on demand when opening the new post screen.
        console.log("Endpoint:check_for_categories", destination.uid)
        const data = await MicroPubApi.get_categories(self.service_object(), destination.uid)
        console.log("Endpoint:check_for_categories:categories", data)
        if(data?.categories != null){
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
      if(data?.items != null){
        destination.set_posts(data.items)
      }
      self.is_loading_posts = false
    }
  }),
  
  update_posts_for_active_destination: flow(function* () {
    const active_destination = self.config.posts_destination()
    if(active_destination){
      self.check_for_posts_for_destination(active_destination)
    }
  }),
  
  set_active_destination: flow(function* (destination, type = null) { 
    if(destination){
      if(type === "posts"){
        self.config.set_selected_posts_destination(destination)// TODO: Probably rewrite this too so it's more generic.
        self.check_for_posts_for_destination(destination)
      }
      else if(type === "pages"){
        self.config.set_selected_posts_destination(destination)
        self.check_for_pages_for_destination(destination)
      }
      else if(type === "uploads"){
        self.config.set_selected_posts_destination(destination)
        self.check_for_uploads_for_destination(destination)
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

  trigger_page_delete(page) {
    console.log("Destination:trigger_page_delete", page)
    Alert.alert(
      "Delete page?",
      "Are you sure you want to delete this page?",
      [
        {
          text: "Cancel",
          style: 'cancel',
        },
        {
          text: "Delete",
          onPress: () => self.delete_page(page),
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
      self.update_posts_for_active_destination()
    }
    else{
      Alert.alert("Whoops", "Could not delete post. Please try again.")
    }
  }),

  delete_page: flow(function* (page) {
    console.log("Destination:delete_page", page)
    const status = yield MicroPubApi.delete_post(self.service_object(), page.url)
    if(status !== DELETE_ERROR){
      App.show_toast("Page was deleted.")
      self.update_pages_for_active_destination()
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
      self.update_posts_for_active_destination()
    }
    else{
      Alert.alert("Error Publishing", "Could not publish the draft. Please try again.")
    }
  }),
  
  check_for_pages_for_destination: flow(function* (destination) { 
    if(destination){
      self.is_loading_pages = true
      console.log("Endpoint:check_for_pages_for_destination", destination.uid)
      const data = yield MicroPubApi.get_pages(self.service_object(), destination.uid)
      console.log("Endpoint:check_for_pages_for_destination:pages", data?.items?.length)
      if(data?.items != null){
        destination.set_pages(data.items)
      }
      self.is_loading_pages = false
    }
  }),
  
  update_pages_for_active_destination: flow(function* () {
    const active_destination = self.config.posts_destination()
    if(active_destination){
      self.check_for_pages_for_destination(active_destination)
    }
  }),
  
  update_uploads_for_active_destination: flow(function* () {
    const active_destination = self.config.posts_destination()
    if(active_destination){
      self.check_for_uploads_for_destination(active_destination)
    }
  }),
  
  check_for_uploads_for_destination: flow(function* (destination) { 
    if(destination){
      self.is_loading_uploads = true
      console.log("Endpoint:check_for_uploads_for_destination", destination.uid)
      const data = yield MicroPubApi.get_uploads(self.service_object(), destination.uid)
      console.log("Endpoint:check_for_uploads_for_destination:posts", data?.items?.length)
      if(data?.items != null && data.items?.length > 0){
        destination.set_uploads(data.items)
      }
      self.is_loading_uploads = false
    }
  }),

  trigger_upload_delete(upload) {
    console.log("Destination:trigger_upload_delete", upload)
    Alert.alert(
      "Delete upload?",
      "Are you sure you want to delete this upload?",
      [
        {
          text: "Cancel",
          style: 'cancel',
        },
        {
          text: "Delete",
          onPress: () => self.delete_upload(upload),
          style: 'destructive'
        },
      ],
      {cancelable: false},
    )
  },

  delete_upload: flow(function* (upload) {
    console.log("Destination:delete_upload", upload)
    const status = yield MicroPubApi.delete_upload(self.service_object(), upload.url)
    if(status !== DELETE_ERROR){
      App.show_toast("Upload was deleted.")
      self.update_uploads_for_active_destination()
    }
    else{
      Alert.alert("Whoops", "Could not delete upload. Please try again.")
    }
  }),

  pick_file: flow(function* (destination) {
    console.log("Destination:pick_file", destination.uid)
    DocumentPicker.pick({
      type: [ DocumentPicker.types.audio, DocumentPicker.types.images, DocumentPicker.types.video ],
      allowMultiSelection: true
    })
      .then((res) => {
        console.log("Destination:pick_file:res", res)
        res.forEach((asset) => {
          console.log("Destination:pick_file:asset", asset)
          destination.upload_media(asset, self)
        })
      })
      .catch((err) => {
        // TODO: SHOW ERROR MESSAGES IF APPLICABLE
        if (!DocumentPicker.isCancel(err)) {
          console.log("Destination:pick_file:err", err)
        }
      })
  }),

  pick_image: flow(function* (destination) {
    console.log("Destination:pick_image", destination.uid)
    launchImageLibrary({
      title: 'Select an asset',
      selectionLimit: 0,
    }, (res) => {
      console.log("Destination:pick_image:res", res)
      if (res.error) {
        // TODO: SHOW ERROR MESSAGES IF APPLICABLE
        console.log("Destination:pick_image:err", res.error)
      }
      else {
        console.log("Destination:pick_image:res", res)
        if (res.assets?.length > 0) {
          res.assets.forEach((asset) => {
            console.log("Destination:pick_image:asset", asset)
            destination.upload_media(asset, self)
          })
        }
      }
    })
  }),
  
  set_initial_config: flow(function* (config = null) {
    if((self.is_microblog || self.type === "micropub") && self.credentials()?.token != null && config != null){
      console.log("Service:set_initial_config:config", config)
      if(config){
        self.config = config
        self.config.hydrate_default_destination()
        if(App.is_share_extension){
          self.check_for_categories()
        }
        return true
      }
    }
    else if(self.type === "xmlrpc" && self.credentials()?.token != null){
      console.log("Service:set_initial_config:xmlrpc")
      const categories = yield XMLRPCApi.get_config(self.service_object())
      console.log("Service:set_initial_config:xml_config", categories)
      if (categories !== XML_ERROR) {
        // We need to iterate over categories and grab just the "categoryName" attributes for now. Not sure if we need ID data?
        const category_names = categories.map(category => category.categoryName)
        console.log("Service:set_initial_config:category_names", category_names)
        
        self.config = {
          "media-endpoint": self.url,
          destination: [{
            uid: self.name,
            name: self.name,
            categories: category_names
          }]
        }
        console.log("Service:set_initial_config:config", self.config)
        return true
      }
    }
    return false
  }),
  
  check_for_syndicate_to_targets: flow(function* () { 
    if(self.config?.destination != null && self.config.destination.length > 0){
      self.config.destination.forEach(async (dest) => {
        const config = await MicroPubApi.get_syndicate_to(self.service_object(), dest.uid)
        if(config !== FETCH_ERROR && config["syndicate-to"]?.length > 0){
          console.log("check_for_syndicate_to_targets", config["syndicate-to"])
          dest.set_syndicate_to_targets(config["syndicate-to"])
        }
      })
    }
  }),
  
}))
.views(self => ({
  
  credentials() {
    return self.name != null && self.name === "Micro.blog" && self.username != null && self.is_microblog ? Tokens.token_for_username(self.username) : Tokens.token_for_service_id(self.id)
  },
  
  service_object(){
    return {
      endpoint: self.url,
      username: self.username,
      token: this.credentials()?.token,
      destination: self.config?.active_destination()?.uid,
      media_endpoint: self.config?.media_endpoint(),
      temporary_destination: self.config?.temporary_destination()?.uid,
      blog_id: self.blog_id,
      type: self.type,
    }
  },

  description() {
    return self.name === "Micro.blog" ? "Micro.blog hosted blog" : "WordPress or compatible blog"
  },
  
  active_destination(){
    return self.config?.active_destination()
  }
  
}))
