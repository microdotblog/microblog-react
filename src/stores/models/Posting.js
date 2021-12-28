import { types, flow } from 'mobx-state-tree';
import Service from './posting/Service';
import { blog_services } from './../enums/blog_services';
import { Alert } from 'react-native';
import MicroPubApi, { POST_ERROR } from '../../api/MicroPubApi';
import { launchImageLibrary } from 'react-native-image-picker';
import Image from './posting/Image'

export default Posting = types.model('Posting', {
  username: types.identifier,
  services: types.optional(types.array(Service), []),
  selected_service: types.maybeNull(types.reference(Service)),
  post_text: types.optional(types.string, ""),
  post_title: types.maybeNull(types.string),
  is_sending_post: types.optional(types.boolean, false),
  post_images: types.optional(types.array(Image), []),
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
    self.post_images = []
    self.is_sending_post = false
  }),
  
  afterCreate: flow(function* () {
    self.hydrate()
  }),
  
  set_post_text: flow(function* (value) {
		self.post_text = value
  }),
  
  set_post_title: flow(function* (value) {
		self.post_title = value === "" ? null : value
  }),
  
  send_post: flow(function* () {
		console.log("Posting:send_post", self.post_text)
    if(self.post_text === "" && self.post_images.length === 0){
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
    const post_success = yield MicroPubApi.send_post(self.selected_service.service_object(), self.post_text, self.post_title, self.post_images)
    self.is_sending_post = false
    if(post_success !== POST_ERROR){
      self.post_text = ""
      self.post_title = null
      self.post_images = []
      return true
    }
    return false
  }),
  
  handle_text_action: flow(function* (action, current_selection) {
		console.log("Posting:handle_text_action", action, current_selection)
    const is_link = action === "[]"
    self.post_text = self.post_text.InsertTextStyle(action, current_selection, is_link)
  }),

  handle_image_action: flow(function* () {
    console.log("Posting:handle_image_action")
    const options = {
      title: 'Select an image',
      mediaType: 'photo',
    };
    const result = yield launchImageLibrary(options)
    console.log("Posting:handle_image_action:result", result)
    if(result.didCancel){
      return
    }
    if(result.errorCode){
      Alert.alert(
        "Whoops...",
        "There was an error with selecting your image, please try again."
      )
      return
    }
    if (result.assets) {
      result.assets.forEach((asset) => {
        console.log("Posting:handle_image_action:asset", asset)
        const image = Image.create(asset)
        self.post_images.push(image)
        image.upload(self.selected_service.service_object())
      })
    }
  })
    

}))
.views(self => ({
  
  posting_enabled(){
    return self.username != null && self.services != null && self.selected_service && self.selected_service.credentials()?.token != null
  },
  
  post_text_length(){
    return self.post_text.length
  }
  
}))