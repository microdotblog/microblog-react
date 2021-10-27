import { types, flow } from 'mobx-state-tree';
import { startApp, loginScreen } from '../screens';
import Auth from './Auth';
import Login from './Login';
import { Linking } from 'react-native'

export default App = types.model('App', {
  is_loading: types.optional(types.boolean, false),
  current_screen_name: types.maybeNull(types.string)
})
.actions(self => ({

  hydrate: flow(function* () {
    console.log("App:hydrate")
    self.is_loading = true
    Auth.hydrate().then(() => {
      startApp().then(() => {
        console.log("App:hydrate:started:is_logged_in", Auth.is_logged_in())
        if(!Auth.is_logged_in()){
          loginScreen()
        }
        App.set_is_loading(false)
        App.set_up_url_listener()
      })
    })
  }),

  set_is_loading: flow(function* (loading) {
    console.log("App:set_is_loading", loading)
    self.is_loading = loading
  }),
  
  set_up_url_listener: flow(function* () {
    console.log("Auth:set_up_url_listener")
    Linking.addEventListener('url', (event) => {
      console.log("Auth:set_up_url_listener:event", event)
      if (event?.url && event?.url.indexOf('/signin/') > -1) {
        Login.trigger_login_from_url(event.url)
      }
    })
    Linking.getInitialURL().then((value) => {
      console.log("Auth:set_up_url_listener:getInitialURL", value)
      if (value?.indexOf('/signin/') > -1) {
        Login.trigger_login_from_url(value)
      }
    })
  }),

  set_current_screen_name: flow(function* (screen_name) {
    console.log("Auth:set_current_screen_name", screen_name)
    self.current_screen_name = screen_name
  }),

}))
.create();