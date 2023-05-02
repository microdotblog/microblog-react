import { types, flow } from 'mobx-state-tree';

export default Services = types.model('Services', {})
.actions(self => ({

  hydrate: flow(function* () {
    console.log("Services:hydrate")
  }),
  
}))
.create({})