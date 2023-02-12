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
    },
    
    set_selected_posts_destination(destination){
      self.selected_posts_destination = destination.uid
    }
    
  }))
.views(self => ({
  
  active_destination(){
    return self.destination != null && self.destination.length > 0 ? self.destination.find(destination => destination['microblog-default']) : null
  },
  
  has_multiple_destinations(){
    return self.destination != null && self.destination.length > 1
  },

  media_endpoint(){
    return self["media-endpoint"] != null ? self["media-endpoint"] : null
  },
  
  posts_destination(){
    return self.destination != null && self.destination.length ? self.destination.find(destination => destination.uid === self.selected_posts_destination) : null
  },
  
  posts_for_destination(){
    return this.posts_destination()?.posts
  }
  
}))