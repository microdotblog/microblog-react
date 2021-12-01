import { types, flow } from 'mobx-state-tree';
import Service from './posting/Service';
import { blog_services } from './../enums/blog_services';

export default Posting = types.model('Posting', {
  username: types.identifier,
  services: types.optional(types.array(Service), []),
  selected_service: types.maybeNull(types.reference(Service))
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
  }),
  
  afterCreate: flow(function* () {
    self.hydrate()
  }),

}))