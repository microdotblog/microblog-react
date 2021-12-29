import { types } from 'mobx-state-tree';
import Destination from './Destination';

export default Config = types.model('Config', {
  "media-endpoint": types.maybeNull(types.string),
  destination: types.optional(types.array(Destination), [])
})
  .actions(self => ({

    set_default_destination(destination) {
      self.destination.forEach(destination => {
        destination.set_default(false);
      });
      destination.set_default(true);
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
  
}))