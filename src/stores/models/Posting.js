import { types, flow } from 'mobx-state-tree';

export default Posting = types.model('Posting', {
  
})
.actions(self => ({

  hydrate: flow(function* () {
    console.log("Posting:hydrate")
    
  }),

}))
.views(self => ({
  
}))