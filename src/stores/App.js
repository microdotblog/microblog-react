import { types, flow } from 'mobx-state-tree';
import { startApp } from '../screens';
import Auth from './Auth';

export default App = types.model('App', {
  is_loading: types.optional(types.boolean, false)
})
.actions(self => ({

  hydrate: flow(function* () {
    console.log("App:hydrate")
    self.is_loading = true
    Auth.hydrate().then(() => {
      startApp().then(() => {
        console.log("App:hydrate:started:is_logged_in", Auth.is_logged_in())
        App.set_is_loading(false)
      })
    })
    
  }),

  set_is_loading: flow(function* (loading) {
    console.log("App:set_is_loading", loading)
    self.is_loading = loading
  })

}))
.create();