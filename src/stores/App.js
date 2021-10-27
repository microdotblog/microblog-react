import { types, flow } from 'mobx-state-tree';
import { startApp, loginScreen, profileScreen, conversationScreen } from '../screens';
import Auth from './Auth';
import Login from './Login';
import { Linking } from 'react-native'

export default App = types.model('App', {
  is_loading: types.optional(types.boolean, false),
  current_screen_name: types.maybeNull(types.string),
  current_screen_id: types.maybeNull(types.string),
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
      else if (event?.url) {
        self.handle_url(event?.url)
      }
    })
    Linking.getInitialURL().then((value) => {
      console.log("Auth:set_up_url_listener:getInitialURL", value)
      if (value?.indexOf('/signin/') > -1) {
        Login.trigger_login_from_url(value)
      }
    })
  }),

  set_current_screen_name_and_id: flow(function* (screen_name, screen_id) {
    console.log("Auth:set_current_screen_name_and_id", screen_name, screen_id)
    self.current_screen_name = screen_name
    self.current_screen_id = screen_id
  }),

  handle_url: flow(function* (url) {
    console.log("Auth:handle_url", url)
    const url_parts = url.split("://")
    if (url_parts.length > 1) {
      const action_parts = url_parts[ 1 ].split("/")
      console.log("Auth:handle_url:action_parts", action_parts)

      if (action_parts.length > 1) {
        const action = action_parts[ 0 ]
        let action_data = action_parts[ 1 ]
        if (action === "photo") {
          action_data = url.split("://photo/")[ 1 ]
        }
        console.log("Auth:handle_url:action", action, action_data)
        
        if (action != null && action_data != null) {
          if (action === "user" || action === "photo" || action === "open") {
            self.navigate_to_screen(action, action_data)
          }
        }
      }
    }
  }),

  navigate_to_screen: flow(function* (action, action_data) {
    switch (action) {
      case "user":
        return profileScreen(action_data, self.current_screen_id)
      case "open":
        return conversationScreen(action_data, self.current_screen_id)
    }
  })

}))
.create();