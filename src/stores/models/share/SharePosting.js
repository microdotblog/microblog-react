import { types, flow } from 'mobx-state-tree';
import { blog_services } from './../../enums/blog_services';
//import ShareApi, { POST_ERROR } from '../../../api/ShareApi';
//import MediaAsset from './../posting/MediaAsset'
import md from 'markdown-it';
import Share from '../../Share'
import ShareService from './ShareService'
const parser = md({ html: true });

export default SharePosting = types.model('SharePosting', {
  username: types.identifier,
  service: types.maybeNull(ShareService),
  post_text: types.optional(types.string, ""),
  post_title: types.maybeNull(types.string),
  is_sending_post: types.optional(types.boolean, false),
  //post_assets: types.optional(types.array(MediaAsset), []),
  post_categories: types.optional(types.array(types.string), []),
  post_status: types.optional(types.string, "published"),
  is_adding_bookmark: types.optional(types.boolean, false),
  text_selection: types.optional(
    types.model('Selection', {
      start: types.optional(types.number, 0),
      end: types.optional(types.number, 0),
    }), {start: 0, end: 0}
  ),
})
.actions(self => ({

  hydrate: flow(function* () {
    console.log("Posting:hydrate", self.username, blog_services)
    // We want to keep everything generic, but for now load just Micro.blog
    if(self.service == null){
      const blog_service = blog_services["microblog"]
      if(blog_service){
        console.log("Posting:hydrate:blog_service", blog_service)
        const new_service = ShareService.create({
          id: `endpoint_${blog_service.name}-${self.username}` ,
          name: blog_service.name,
          url: blog_service.url,
          username: self.username,
          type: blog_service.type,
          is_microblog: true
        })
        if(new_service){
          self.selected_service = new_service
        }
      }
    }
    //self.post_assets = []
    self.is_sending_post = false
    self.is_adding_bookmark = false
  }),
  
  afterCreate: flow(function* () {
    self.hydrate()
  }),
  
  set_post_text: flow(function* (value) {
		self.post_text = value
  }),

  set_post_text_from_typing: flow(function* (value) {
    self.post_text = value
  }),
  
  set_post_title: flow(function* (value) {
		self.post_title = value === "" ? null : value
  }),
  
  send_post: flow(function* () {
		console.log("Posting:send_post", self.post_text)
    // if(self.post_text === "" && self.post_assets.length === 0){
    //   Alert.alert(
    //     "Whoops...",
    //     "There is nothing to post... type something to get started."
    //   )
    //   return false
    // }
    // if(self.is_sending_post){
    //   Alert.alert(
    //     "Whoops...",
    //     "We're already sending another message, please wait and try again."
    //   )
    //   return false
    // }
    // if(self.post_assets.filter(image => image.is_uploading)?.length > 0){
    //   Alert.alert(
    //     "Whoops...",
    //     "We're still uploading your media. Please wait and try again."
    //   )
    //   return false
    // }
    // self.is_sending_post = true
    // const post_success = yield MicroPubApi.send_post(self.selected_service.service_object(), self.post_text, self.post_title, self.post_assets, self.post_categories, self.post_status)
    // self.is_sending_post = false
    // if(post_success !== POST_ERROR){
    //   self.post_text = ""
    //   self.post_title = null
    //   self.post_assets = []
    //   self.post_categories = []
    //   self.post_status = "published"
    //   return true
    // }
    return false
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

  // add_bookmark: flow(function* (url) {
  //   console.log("Posting:add_bookmark", url)
  //   self.is_adding_bookmark = true
  //   const post_success = yield Share.send_entry(self.selected_service.service_object(), url, "bookmark-of")
  //   self.is_adding_bookmark = false
  //   if (post_success !== POST_ERROR) {
  //     // TODO
  //     return true
  //   }
  //   return false
  // }),

  set_text_selection: flow(function* (selection) {
    self.text_selection = selection
  }),

  clear_post: flow(function* () {
    self.post_text = ""
    self.post_title = null
    self.post_assets = []
    self.post_categories = []
    self.post_url = null
  })
  
}))
.views(self => ({
  
  posting_enabled(){
    return self.username != null && self.services != null && self.selected_service && self.selected_service.credentials()?.token != null
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
    return has_blockquote ? Share.max_characters_allowed * 2 : Share.max_characters_allowed
  }
  
}))