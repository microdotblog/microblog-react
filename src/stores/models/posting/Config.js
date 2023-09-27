import { types } from 'mobx-state-tree';
import Destination from './Destination';

export default Config = types.model('Config', {
  "media-endpoint": types.maybeNull(types.string),
  destination: types.optional(types.array(Destination), []),
  selected_posts_destination: types.maybeNull(types.string, "")
})
  .actions(self => ({

    set_default_destination(destination) {
      self.destination.forEach(destination => {
        destination.set_default(false);
      });
      destination.set_default(true);
      self.selected_posts_destination = destination.uid
    },
    
    hydrate_default_destination(){
      const default_destination = self.destination.find(d => d["microblog-default"] === true)
      if(default_destination){
        self.selected_posts_destination = default_destination.uid
      }
      else if(self.destination.length > 0){
        self.selected_posts_destination = self.destination[self.destination.length - 1]?.uid
      }
    },
    
    set_selected_posts_destination(destination){
      self.selected_posts_destination = destination.uid
    },
    
    set_previously_selected_posts_destination(uid){
      const default_destination = self.destination.find(d => d.uid === uid)
      console.log("Config:set_previously_selected_posts_destination", default_destination)
      if(default_destination){
        this.set_default_destination(default_destination)
      }
      else{
        this.hydrate_default_destination()
      }
    }
    
  }))
.views(self => ({
  
  active_destination(){
    const destination = self.destination?.find(destination => destination['microblog-default'])
    return self.destination != null && self.destination.length > 0 ? destination ? destination : self.destination[self.destination.length - 1] : null
  },
  
  has_multiple_destinations(){
    return self.destination != null && self.destination.length > 1
  },

  media_endpoint(){
    return self["media-endpoint"] != null ? self["media-endpoint"] : null
  },

  temporary_destination() {
    return self.destination != null && self.destination.length ? self.destination.find(destination => destination.uid === self.selected_posts_destination) : null
  },
  
  posts_destination(){
    return self.destination != null && self.destination.length ? self.destination.find(destination => destination.uid === self.selected_posts_destination) : null
  },
  
  posts_for_destination(){
    return this.posts_destination()?.posts
  },
  
  pages_destination(){
    return self.destination != null && self.destination.length ? self.destination.find(destination => destination.uid === self.selected_posts_destination) : null
  },
  
  pages_for_destination(){
    return this.pages_destination()?.pages
  },

  uploads_destination(){
    return self.destination != null && self.destination.length ? self.destination.find(destination => destination.uid === self.selected_posts_destination) : null
  },

  uploads_for_destination() {
    return this.uploads_destination()?.uploads
  },

  temp_uploads_for_destination() {
    return this.uploads_destination()?.temp_uploads.filter(upload => !upload.cancelled).reverse()
  },

  sorted_destinations() {
    return self.destination.slice().sort((a, b) => {
      const a_is_default = a["microblog-default"];
      const b_is_default = b["microblog-default"];
      return b_is_default - a_is_default;
    });
  }
  
}))