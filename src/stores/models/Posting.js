import { types, flow, destroy } from 'mobx-state-tree';
import Service from './posting/Service';
import { blog_services } from './../enums/blog_services';
import { Alert, Platform, Linking } from 'react-native';
import MicroPubApi, { POST_ERROR } from '../../api/MicroPubApi';
import XMLRPCApi, { XML_ERROR } from '../../api/XMLRPCApi';
import { launchImageLibrary } from 'react-native-image-picker';
import MediaAsset from './posting/MediaAsset'
import App from '../App'
import Clipboard from '@react-native-clipboard/clipboard';
import { imageOptionsScreen, POSTING_SCREEN } from '../../screens';
import { imageCropScreen } from '../../screens';
import { Navigation } from 'react-native-navigation';
import Tokens from '../Tokens';
import md from 'markdown-it';
const parser = md({ html: true });

export default Posting = types.model('Posting', {
  username: types.identifier,
  services: types.optional(types.array(Service), []),
  selected_service: types.maybeNull(types.reference(Service)),
  post_text: types.optional(types.string, ""),
  post_title: types.maybeNull(types.string),
  is_sending_post: types.optional(types.boolean, false),
  post_assets: types.optional(types.array(MediaAsset), []),
  post_categories: types.optional(types.array(types.string), []),
  post_syndicates: types.optional(types.array(types.string), []),
  post_status: types.optional(types.string, "published"),
  is_adding_bookmark: types.optional(types.boolean, false),
  text_selection: types.optional(
    types.model('Selection', {
      start: types.optional(types.number, 0),
      end: types.optional(types.number, 0),
    }), {start: 0, end: 0}
  ),
  is_editing_post: types.optional(types.boolean, false),
  post_url: types.maybeNull(types.string)
})
.actions(self => ({

  hydrate: flow(function* () {
    console.log("Posting:hydrate", self.username, blog_services)
    // We want to keep everything generic, but for now load just Micro.blog
    if(self.services.length === 0){
      const blog_service = blog_services["microblog"]
      if(blog_service){
        console.log("Posting:hydrate:blog_service", blog_service)
        const new_service = Service.create({
          id: `endpoint_${blog_service.name}-${self.username}` ,
          name: blog_service.name,
          url: blog_service.url,
          username: self.username,
          type: blog_service.type,
          is_microblog: true
        })
        if(new_service){
          self.services.push(new_service)
          self.selected_service = new_service
        }
      }
    }
    else if(self.selected_service == null){
      // We want to select one default endpoint
      self.selected_service = self.services[0]
    }
    self.post_assets = []
    self.is_sending_post = false
    self.is_adding_bookmark = false
    self.is_editing_post = false
    
    if(self.selected_service && self.selected_service.active_destination()?.syndicates?.length > 0){
      let syndicate_targets = []
      self.selected_service.active_destination()?.syndicates.forEach((syndicate) => {
        syndicate_targets.push(syndicate.uid)
      })
      self.post_syndicates = syndicate_targets
    }

    if (App.is_share_extension) {
      self.post_text = ""
    }

  }),
  
  hydrate_post_edit: flow(function* (post) {
    console.log("hydrate_post_edit", post)
    self.is_editing_post = true
    self.post_title = post.name != "" ? post.name : null
    self.post_text = post.content
    self.post_url = post.url
  }),
  
  hydrate_page_edit: flow(function* (page) {
    console.log("hydrate_page_edit", page)
    self.is_editing_post = true
    self.post_title = page.name != "" ? page.name : null
    self.post_text = page.content
    self.post_url = page.url
  }),
  
  afterCreate: flow(function* () {
    self.hydrate()
  }),
  
  set_post_text: flow(function* (value) {
		self.post_text = value
  }),

  set_post_text_from_typing: flow(function* (value) {
    self.post_text = value
    App.check_usernames(self.post_text)
  }),
  
  set_post_text_from_action: flow(function* (value) {
    const text = value.replace("microblog://post?text=", "")
    self.post_text = decodeURI(text.replace(/%3A/g, ":"))
  }),
  
  set_post_title: flow(function* (value) {
		self.post_title = value === "" ? null : value
  }),
  
  send_post: flow(function* () {
		console.log("Posting:send_post", self.post_text, self.selected_service.service_object().destination)
    if(self.post_text === "" && self.post_assets.length === 0){
      Alert.alert(
        "Whoops...",
        "There is nothing to post... type something to get started."
      )
      return false
    }
    if(self.is_sending_post){
      Alert.alert(
        "Whoops...",
        "We're already sending another message, please wait and try again."
      )
      return false
    }
    if(!App.is_share_extension && self.post_assets.filter(image => image.is_uploading)?.length > 0){
      Alert.alert(
        "Whoops...",
        "We're still uploading your media. Please wait and try again."
      )
      return false
    }
    else if (App.is_share_extension && self.post_assets.length > 0) {
      self.is_sending_post = true
      const upload_success = yield self.upload_assets()
      if (!upload_success) {
        self.is_sending_post = false
        Alert.alert(
          "Whoops...",
          "We couldn't upload your media. Please try again."
        )
        return false
      }
    }
    self.is_sending_post = true
    const post_success = self.selected_service.type === "xmlrpc" ?
      yield XMLRPCApi.send_post(self.selected_service.service_object(), self.post_text, self.post_title, self.post_assets, self.post_categories, self.post_status)
      : yield MicroPubApi.send_post(self.selected_service.service_object(), self.post_text, self.post_title, self.post_assets, self.post_categories, self.post_status, self.post_syndicates.length === self.selected_service.active_destination()?.syndicates?.length ? null : self.post_syndicates)
    self.is_sending_post = false
    if(post_success !== POST_ERROR && post_success !== XML_ERROR){
      self.post_text = ""
      self.post_title = null
      self.post_assets = []
      self.post_categories = []
      self.post_status = "published"
      if(self.selected_service && self.selected_service.active_destination()?.syndicates?.length > 0){
        let syndicate_targets = []
        self.selected_service.active_destination()?.syndicates.forEach((syndicate) => {
          syndicate_targets.push(syndicate.uid)
        })
        self.post_syndicates = syndicate_targets
      }
      return true
    }
    return false
  }),
  
  handle_text_action: flow(function* (action) {
    console.log("Posting:handle_text_action", action)
    const is_link = action === "[]"
    if (is_link) {
      action = "[]()"
      let has_web_url = null
      let url = null
      if (Platform.OS === "ios") {
        has_web_url = yield Clipboard.hasWebURL()
      }
      else {
        url = yield Clipboard.getString()
        has_web_url = yield Linking.canOpenURL(url)
        // I'm using this as a fallback, as Android sometimes doesn't know that it can open a URL.
        if (!has_web_url) {
          has_web_url = url.startsWith("http://") || url.startsWith("https://")
        }
      }
      console.log("HAS WEB URL", url, has_web_url)
      if (has_web_url) {
        if (url === null) {
          url = yield Clipboard.getString()
        }
        action = `[](${ url })`
        console.log("TEXT OPTION", action)
        self.post_text = self.post_text.InsertTextStyle(action, self.text_selection, true, url)
      }
      else {
        self.post_text = self.post_text.InsertTextStyle(action, self.text_selection, true)
      }
    }
    else {
      self.post_text = self.post_text.InsertTextStyle(action, self.text_selection, is_link)
    }
    
  }),

  handle_asset_action: flow(function* (component_id) {
    console.log("Posting:handle_asset_action")
    const options = {
      title: 'Select an image',
      mediaType: 'photo',
      ...self.selected_service.type === "xmlrpc" &&
        {
          includeBase64: true,
        }
    };
    const result = yield launchImageLibrary(options)
    console.log("Posting:handle_asset_action:result", result)
    if(result.didCancel){
      return
    }
    if(result.errorCode){
      Alert.alert(
        "Whoops...",
        "There was an error with selecting your image or video, please try again."
      )
      return
    }
    if (result.assets) {
      result.assets.forEach((asset) => {
        console.log("Posting:handle_image_action:asset", asset)

        // disabling the crop screen for 3.0, will bring back in 3.1
        if (false) {
          const media_asset = MediaAsset.create(asset)
          imageCropScreen(media_asset, component_id)
        }
        else {
          const media_asset = MediaAsset.create(asset)
          self.post_assets.push(media_asset)
          media_asset.upload(self.selected_service.service_object())
        }
      })
    }
  }),

  create_and_attach_asset: flow(function* (asset) {
    console.log("Posting:create_and_attach_asset", asset)
    const existing_asset = self.post_assets.find(file => file.uri === asset.uri)
    if(existing_asset == null){
      const media_asset = MediaAsset.create(asset)
      self.attach_asset(media_asset)
    }
  }),
  
  attach_asset: flow(function* (asset) {
    self.post_assets.push(asset)
    if (!App.is_share_extension) {
      asset.upload(self.selected_service.service_object())
    }
  }),

  asset_action: flow(function* (asset, index) {
    console.log("Posting:image_action", image)
    const existing_index = self.post_assets.findIndex(file => file.uri === asset.uri)
    if (existing_index > -1) {
      // TODO: Add correct terminology for file type
      Alert.alert(
        "Remove image",
        "Are you sure you want to remove this image from this post?",
        [
          {
            text: "Cancel",
            style: 'cancel',
          },
          {
            text: "Remove",
            onPress: () => self.remove_asset(index),
            style: 'destructive'
          },
        ],
        {cancelable: false},
      );
    }
  }),
  
  image_option_screen: flow(function* (image, index, component_id) {
    console.log("Posting:image_option_screen", image)
    return imageOptionsScreen(image, index, component_id)
  }),
  
  remove_asset: flow(function* (media_index) {
    console.log("Posting:remove_image:index", media_index)
    const media = self.post_assets[ media_index ]
    if (media.is_uploading) { 
      yield media.cancel_upload()
    }
    self.post_assets.splice(media_index, 1)
  }),

  remove_post_categories: flow(function* () {
    console.log("Posting:remove_post_categories")
    self.post_categories = []
  }),

  handle_post_category_select: flow(function* (category) {
    console.log("Posting:handle_post_category_select")
    if (self.post_categories.includes(category)) {
      self.post_categories = self.post_categories.filter(c => c !== category)
    } else {
      self.post_categories.push(category)
    }
  }),

  handle_post_status_select: flow(function* (status) {
    console.log("Posting:handle_post_status_select: " + status)
    self.post_status = status
    Navigation.mergeOptions(POSTING_SCREEN, {
      topBar: {
        rightButtons: [
          {
            id: 'post_button',
            text: status === "draft" ? "Save" : "Post",
            color: '#f80'
          }
        ]
      }
    });
  }),

  add_bookmark: flow(function* (url) {
    console.log("Posting:add_bookmark", url)
    self.is_adding_bookmark = true
    const post_success = yield MicroPubApi.send_entry(self.selected_service.service_object(), url, "bookmark-of")
    self.is_adding_bookmark = false
    if (post_success !== POST_ERROR) {
      App.handle_web_view_message("bookmark_added_from_app")
      return true
    }
    return false
  }),

  set_text_selection: flow(function* (selection) {
    self.text_selection = selection
  }),
  
  send_update_post: flow(function* () {
    console.log("Posting:send_update_post", self.post_text)
    if(self.post_text === ""){
      Alert.alert(
        "Whoops...",
        "There is nothing to post... type something to get started."
      )
      return false
    }
    if(self.is_sending_post){
      Alert.alert(
        "Whoops...",
        "We're already sending another message, please wait and try again."
      )
      return false
    }
    self.is_sending_post = true
    const post_success = yield MicroPubApi.post_update(self.selected_service.service_object(), self.post_text, self.post_url, self.post_title)
    self.is_sending_post = false
    if(post_success !== POST_ERROR){
      self.clear_post()
      return true
    }
    return false
  }),
  
  clear_post: flow(function* () {
    self.post_text = ""
    self.post_title = null
    self.post_assets = []
    self.post_categories = []
    self.is_editing_post = false
    self.post_url = null
    self.reset_post_syndicates()
  }),

  upload_assets: flow(function* () {
    console.log("Posting:upload_assets")
    for (const asset of self.post_assets.filter(asset => !asset.did_upload)) {
      yield asset.upload(self.selected_service.service_object())
    }
    return self.post_assets.every(asset => asset.did_upload)
  }),
  
  create_new_service: flow(function* (blog_service, name, endpoint, username, blog_id = null) {
    console.log("Posting:create_new_service", blog_service, endpoint, username)
    const service_id = `endpoint_${blog_service.name}-${username}-${name}`
    const existing_service = self.services.find(s => s.id === service_id)
    if(existing_service != null){
      destroy(existing_service)
    }
    const new_service = Service.create({
      id: service_id,
      name: name,
      url: endpoint,
      username: username,
      type: blog_service.type,
      is_microblog: false,
      blog_id: blog_id
    })
    if(new_service){
      self.services.push(new_service)
      return new_service
    }
    return false
  }),
  
  activate_new_service: flow(function* (service = null) {
    if(service === null){return false}
    self.selected_service = service
    console.log("Posting:activate_new_service", service)
    return true
  }),
  
  set_default_service: flow(function* () {
    if(self.services.length > 0){
      self.selected_service = self.services[0]
      return self.selected_service
    }
    return false
  }),
  
  set_custom_service: flow(function* () {
    if(self.services.length > 0 && self.first_custom_service() != null){
      self.selected_service = self.first_custom_service()
      return self.selected_service
    }
    return false
  }),
  
  remove_custom_services: flow(function* () {
    console.log("Posting:remove_custom_services")
    const services = self.services.filter(s => !s.is_microblog)
    if(services){
      services.forEach((service) => {
        Tokens.destroy_token_for_service_id(service.id)
        destroy(service)
      })
    }
  }),
  
  handle_post_syndicates_select: flow(function* (uid) {
    console.log("Posting:handle_post_syndicates_select")
    if (self.post_syndicates.includes(uid)) {
      self.post_syndicates = self.post_syndicates.filter(s => s !== uid)
    } else {
      self.post_syndicates.push(uid)
    }
  }),
  
  reset_post_syndicates: flow(function* () {
    console.log("Posting:reset_post_syndicates")
    if(self.selected_service && self.selected_service.active_destination()?.syndicates?.length > 0){
      let syndicate_targets = []
      self.selected_service.active_destination()?.syndicates.forEach((syndicate) => {
        syndicate_targets.push(syndicate.uid)
      })
      self.post_syndicates = syndicate_targets
    }
  }),
  
}))
.views(self => ({
  
  posting_enabled(){
    return self.username != null && self.services != null && self.selected_service && self.selected_service.credentials()?.token != null
  },
  
  first_custom_service(){
    return self.services != null && self.services.length > 1 ? self.services.find(s => !s.is_microblog) : null
  },
  
  post_text_length(){
    const html = parser.render(self.post_text)
    const regex = /(<([^>]+)>)/ig
    var text = html.replace(regex, '')

    // if last char is a newline, chop it off
    if (text[text.length - 1] == '\n') {
      text = text.substring(0, text.length - 1)
    }

    return text ? text.length : 0
  },
  
  max_post_length(){
    const html = parser.render(self.post_text)
    const has_blockquote = html.includes('<blockquote')
    return has_blockquote ? App.max_characters_allowed * 2 : App.max_characters_allowed
  },
  
  post_chars_offset(is_post_edit) {
    var offset = 0
    if (is_post_edit) {
      offset = -55
    }
    else {
      offset = -35
    }
    
   if (App.found_users.length > 0) {
     // if usernames bar, move chars counter higher
     offset -= 40
   }
    
    return offset
  },

  reply_chars_offset() {
    var offset = -25
    
    if (App.found_users.length > 0) {
      // if usernames bar, move chars counter higher
      offset -= 40
    }
    
    return offset
  }
  
}))