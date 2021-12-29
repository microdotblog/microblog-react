import { types, flow } from 'mobx-state-tree';
import Tokens from './../../Tokens';
import MicroPubApi from './../../../api/MicroPubApi';
import Config from './Config';

export default Service = types.model('Service', {
  id: types.identifier,
  name: types.maybeNull(types.string),
  url: types.maybeNull(types.string),
  type: types.maybeNull(types.string),
  username: types.maybeNull(types.string),
  is_microblog: types.optional(types.boolean, false),
  config: types.maybeNull(Config)
})
.actions(self => ({

  hydrate: flow(function* () {
    console.log("Endpoint:hydrate", self.id)
    if(self.is_microblog){
      const config = yield MicroPubApi.get_config(self.service_object())
      console.log("Endpoint:hydrate:config", config)
      if(config){
        self.config = config
        self.check_for_categories()
      }
    }
  }),

  check_for_categories: flow(function* () { 
    if(self.config?.destination != null && self.config.destination.length > 0){
      self.config.destination.forEach(async (destination) => {
        console.log("Endpoint:check_for_categories", destination.uid)
        const data = await MicroPubApi.get_categories(self.service_object(), destination.uid)
        console.log("Endpoint:check_for_categories:categories", data)
        if(data?.categories != null && data.categories.length > 0){
          destination.set_categories(data.categories)
        }
      })
    }
  }),
  
  afterCreate: flow(function* () {
    self.hydrate()
  }),

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