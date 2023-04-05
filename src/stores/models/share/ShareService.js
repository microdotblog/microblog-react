import { types, flow } from 'mobx-state-tree';
import Tokens from './../../Tokens';
//import Config from './Config';
import ShareApi from '../../../api/ShareApi'

export default ShareService = types.model('ShareService', {
  id: types.identifier,
  name: types.maybeNull(types.string),
  url: types.maybeNull(types.string),
  type: types.maybeNull(types.string),
  username: types.maybeNull(types.string),
  is_microblog: types.optional(types.boolean, false),
  //config: types.maybeNull(Config)
})
.actions(self => ({

  hydrate: flow(function* () {
    console.log("ShareService:hydrate", self.id)
    if(self.is_microblog){
      const config = yield ShareApi.get_config(self.service_object())
      console.log("ShareService:hydrate:config", config)
      if(config){
        // self.config = config
        // self.config.hydrate_default_destination()
        //self.check_for_categories()
      }
    }
  }),
  
  afterCreate: flow(function* () {
    self.hydrate()
  }),

  // check_for_categories: flow(function* () { 
  //   if(self.config?.destination != null && self.config.destination.length > 0){
  //     self.config.destination.forEach(async (destination) => {
  //       // TODO: Perhaps check if we already have categories downloaded before fetching,
  //       // as we download them on demand when opening the new post screen.
  //       console.log("Endpoint:check_for_categories", destination.uid)
  //       const data = await MicroPubApi.get_categories(self.service_object(), destination.uid)
  //       console.log("Endpoint:check_for_categories:categories", data)
  //       if(data?.categories != null && data.categories.length > 0){
  //         destination.set_categories(data.categories)
  //       }
  //     })
  //   }
  // }),
  
  // set_active_destination: flow(function* (destination, type = null) { 
  //   if(destination){
  //     if(type === "posts"){
  //       // self.config.set_selected_posts_destination(destination)// TODO: Probably rewrite this too so it's more generic.
  //       // self.check_for_posts_for_destination(destination)
  //     }
  //   }
  // })

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
      // destination: self.config?.active_destination()?.uid,
      // media_endpoint: self.config?.media_endpoint(),
      // temporary_destination: self.config?.temporary_destination()?.uid,
    }
  }
  
}))