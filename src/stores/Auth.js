import { types, flow } from 'mobx-state-tree';

export default Auth = types.model('Auth', {
})
.actions(self => ({

  hydrate: flow(function* () {
    console.log("Auth:hydrate")
  }),


}))
.create();