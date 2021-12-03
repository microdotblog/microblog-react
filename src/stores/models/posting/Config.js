import { types } from 'mobx-state-tree';
import Destination from './Destination';

export default Config = types.model('Config', {
  "media-endpoint": types.maybeNull(types.string),
  destination: types.optional(types.array(Destination), [])
})
.views(self => ({
  
  active_destination(){
    return self.destination != null && self.destination.length > 0 ? self.destination.find(destination => destination['microblog-default']) : null
  },
  
  has_multiple_destinations(){
    return self.destination != null && self.destination.length > 1
  },
  
}))