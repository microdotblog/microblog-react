import { types, flow } from 'mobx-state-tree';
import { startApp, loginScreen, profileScreen, conversationScreen, bookmarksScreen } from '../screens';
import Auth from './Auth';
import Login from './Login';
import { Linking } from 'react-native'
import { Navigation } from "react-native-navigation";
import { RNNBottomSheet } from 'react-native-navigation-bottom-sheet';

let SCROLLING_TIMEOUT = null

export default App = types.model('App', {
  is_loading: types.optional(types.boolean, false),
  current_screen_name: types.maybeNull(types.string),
  current_screen_id: types.maybeNull(types.string),
  image_modal_is_open: types.optional(types.boolean, false),
  current_image_url: types.maybeNull(types.string),
  is_scrolling: types.optional(types.boolean, false)
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
    console.log("App:set_up_url_listener")
    Linking.addEventListener('url', (event) => {
      console.log("App:set_up_url_listener:event", event)
      if (event?.url && event?.url.indexOf('/signin/') > -1) {
        Login.trigger_login_from_url(event.url)
      }
      else if (event?.url) {
        self.handle_url(event?.url)
      }
    })
    Linking.getInitialURL().then((value) => {
      console.log("App:set_up_url_listener:getInitialURL", value)
      if (value?.indexOf('/signin/') > -1) {
        Login.trigger_login_from_url(value)
      }
    })
  }),

  set_current_screen_name_and_id: flow(function* (screen_name, screen_id) {
    console.log("App:set_current_screen_name_and_id", screen_name, screen_id)
    if(screen_name.includes("microblog.component")){
      return
    }
    self.current_screen_name = screen_name
    self.current_screen_id = screen_id
  }),

  handle_url: flow(function* (url) {
    console.log("App:handle_url", url)
    const url_parts = url.split("://")
    if (url_parts.length > 1) {
      const action_parts = url_parts[ 1 ].split("/")
      console.log("App:handle_url:action_parts", action_parts)

      if (action_parts.length > 1) {
        const action = action_parts[ 0 ]
        let action_data = action_parts[ 1 ]
        if (action === "photo") {
          action_data = url.split("://photo/")[ 1 ]
        }
        console.log("App:handle_url:action", action, action_data)

        if (action != null && action_data != null) {
          if (action === "user" || action === "photo" || action === "open") {
            self.navigate_to_screen(action, action_data)
          }
        }
      }
    }
  }),

  navigate_to_screen: flow(function* (action, action_data) {
    if(!self.is_scrolling){
      switch (action) {
        case "user":
          return profileScreen(action_data, self.current_screen_id)
        case "open":
          return conversationScreen(action_data, self.current_screen_id)
        case "photo":
          App.set_image_modal_data_and_activate(action_data)
      }
    }
  }),

  navigate_to_screen_from_menu: flow(function* (screen) {
    console.log("App:navigate_to_screen_from_menu", screen, RNNBottomSheet.getComponentName())
    RNNBottomSheet.closeBottomSheet()
    if(screen === "Bookmarks"){
      return bookmarksScreen(self.current_screen_id)
    }
    else{
      let tab_index = 0
      let should_pop = false
      switch (screen) {
        case "Timeline":
          tab_index = 0;
          should_pop = self.current_screen_id !== "TIMELINE_SCREEN"
          if(should_pop){
            Navigation.popToRoot("TIMELINE_SCREEN")
          }
          break;
        case "Mentions":
          tab_index = 1;
          should_pop = self.current_screen_id !== "MENTIONS_SCREEN"
          if(should_pop){
            Navigation.popToRoot("MENTIONS_SCREEN")
          }
          break;
        case "Discover":
          tab_index = 2;
          should_pop = self.current_screen_id !== "DISCOVER_SCREEN"
          if(should_pop){
            Navigation.popToRoot("DISCOVER_SCREEN")
          }
          break;
      }
      console.log("App:navigate_to_screen_from_menu:index", screen, tab_index, self.current_screen_id, should_pop)
      Navigation.mergeOptions('ROOT', {
        bottomTabs: {
          currentTabIndex: tab_index
        }
      });
    }
  }),

  set_image_modal_data_and_activate: flow(function* (url) {
    self.current_image_url = url
    self.image_modal_is_open = true
  }),

  reset_image_modal: flow(function* () {
    self.image_modal_is_open = false
    self.current_image_url = null
  }),

  set_is_scrolling: flow(function* () {
    self.is_scrolling = true
    clearTimeout(SCROLLING_TIMEOUT)
    SCROLLING_TIMEOUT = setTimeout(() => {
      App.reset_is_scrolling()
    }, 300)
  }),

  reset_is_scrolling: flow(function* () {
    self.is_scrolling = false
  }),

  handle_url_from_webview: flow(function* (url) {
    console.log("App:handle_url_from_webview", url)

    // This is going to be messy. Don't judge.
    if (url.indexOf('https://micro.blog/') > -1 || url.indexOf('http://micro.blog/') > -1) {
      const after_mb_link = url.replace('https://micro.blog/', '').replace('http://micro.blog/', '');
      const parts = after_mb_link.split("/")
      console.log("App:handle_url_from_webview:parts", after_mb_link, parts)

      if(parts.length === 2){
        // This is probably a convo
        // Now we also want to check if it contains anything but a number
        const number = parts[1].match(/\d+/);
        if (number === null) {
          // Now check for discover links
          if (parts[0] === 'discover' && parts[1] !== null) {
            if (parts[1].indexOf('search') > -1) {
              // This going to be a user search, but for now we just link it
              App.open_url(url)
            }
            else {
              // TODO: Load Discover More
              App.open_url(url)
            }
          }
          else {
            App.open_url(url)
          }

        }
        else {
          App.navigate_to_screen("open", number[0])
        }
      }
      else {
        const username = url.replace('https://micro.blog/', '').replace('http://micro.blog/', '')
        App.navigate_to_screen("user", username)
      }
    }
    else{
      // It's just a normal URL
      App.open_url(url)
    }

  }),

  open_url: flow(function* (url) {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("App:handle_url_from_webview:error_handling_url:", url);
        alert("Something went wrong with that link...")
      }
    });
  })

}))
.create();
