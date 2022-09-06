import { types, flow } from 'mobx-state-tree';
import { startApp, loginScreen, profileScreen, conversationScreen, bookmarksScreen, discoverTopicScreen, replyScreen, bookmarkScreen, helpScreen, Screens } from '../screens';
import Auth from './Auth';
import Login from './Login';
import Reply from './Reply';
import { Linking, ToastAndroid, Appearance, AppState, Platform } from 'react-native'
import { Navigation } from "react-native-navigation";
import { RNNBottomSheet } from 'react-native-navigation-bottom-sheet';
import Push from './Push'
import { theme_options } from '../utils/navigation'

let SCROLLING_TIMEOUT = null
let CURRENT_WEB_VIEW_REF = null

export default App = types.model('App', {
  is_loading: types.optional(types.boolean, false),
  current_screen_name: types.maybeNull(types.string),
  current_screen_id: types.maybeNull(types.string),
  image_modal_is_open: types.optional(types.boolean, false),
  current_image_url: types.maybeNull(types.string),
  is_scrolling: types.optional(types.boolean, false),
  theme: types.optional(types.string, 'light'),
  is_switching_theme: types.optional(types.boolean, false),
})
.actions(self => ({

  hydrate: flow(function* () {
    console.log("App:hydrate")
    self.is_loading = true
    yield App.set_current_initial_theme()
    Push.hydrate()
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
    if(screen_name.includes("microblog.component") || Platform.OS === 'ios' && (screen_name.includes("microblog.LoginScreen") || screen_name.includes("microblog.AddBookmarkScreen"))){
      return
    }
    self.current_screen_name = screen_name
    self.current_screen_id = screen_id

    if (screen_id === "DISCOVER_SCREEN") {
      Discover.shuffle_random_emoji()
    }
  }),

  handle_url: flow(function* (url) {
    console.log("App:handle_url", url)
    const url_parts = url.split("://")
    if (url_parts.length > 1 && !self.is_scrolling) {
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
          if (action === "user" || action === "photo" || action === "open" || action === "reply") {
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
          return App.set_image_modal_data_and_activate(action_data)
        case "discover/topic":
          return discoverTopicScreen(action_data, self.current_screen_id)
        case "reply":
          Reply.hydrate(action_data)
          return replyScreen(action_data, self.current_screen_id)
        case "bookmark":
          return bookmarkScreen(action_data, self.current_screen_id)
      }
    }
  }),

  navigate_to_screen_from_menu: flow(function* (screen) {
    console.log("App:navigate_to_screen_from_menu", screen, RNNBottomSheet.getComponentName())
    RNNBottomSheet.closeBottomSheet()
    if(screen === "Bookmarks"){
      return bookmarksScreen(self.current_screen_id)
    }
    else if (screen === "Help") {
      return helpScreen()
    }
    else{
      let tab_index = 0
      let should_pop = false
      switch (screen) {
        case "Timeline":
          tab_index = 0;
          should_pop = self.current_screen_id !== "microblog.TimelineScreen"
          if(should_pop){
            Navigation.popToRoot("microblog.TimelineScreen")
          }
          break;
        case "Mentions":
          tab_index = 1;
          should_pop = self.current_screen_id !== "microblog.MentionsScreen"
          if(should_pop){
            Navigation.popToRoot("microblog.MentionsScreen")
          }
          break;
        case "Discover":
          tab_index = 2;
          should_pop = self.current_screen_id !== "microblog.DiscoverScreen"
          if(should_pop){
            Navigation.popToRoot("microblog.DiscoverScreen")
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
    self.current_image_url = decodeURI(url)
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
    if (AppState.currentState === "background" || AppState.currentState === "inactive") {
      return
    }

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
        else if(parts[0] === "books"){
          App.open_url(url)
        }
        else if (parts[ 0 ] === "bookmarks") {
          App.navigate_to_screen("bookmark", number[0])
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
      }
      else {
        try {
          Linking.openURL(url)
        }
        catch (error) {
          console.log("App:open_url:error", error)
          alert("Something went wrong with that link...")
        }
      }
    });
  }),

  set_current_web_view_ref: flow(function* (current_ref) {
    console.log("App:set_current_web_view_ref")
    CURRENT_WEB_VIEW_REF = current_ref
  }),

  handle_web_view_message: flow(function* (message) {
    console.log("App:handle_web_view_message", message)
    if (message === "bookmark_added") {
      ToastAndroid.showWithGravity("Bookmark added!", ToastAndroid.SHORT, ToastAndroid.CENTER)
    }
    else if (message === "bookmark_removed") {
      ToastAndroid.showWithGravity("Bookmark removed!", ToastAndroid.SHORT, ToastAndroid.CENTER)
    }
    if (message === "bookmark_removed" && App.current_screen_id === "BOOKMARKS_SCREEN") {
      if (CURRENT_WEB_VIEW_REF) {
        try {
          CURRENT_WEB_VIEW_REF.injectJavaScript(`window.scrollTo({ top: 0 })`)
          CURRENT_WEB_VIEW_REF.reload()
        } catch (error) {
          console.log("App:handle_web_view_message:bookmark_added:error", error)
        }
      }
    }
    else if (message === "bookmark_added_from_app") {
      ToastAndroid.showWithGravity("Bookmark added!", ToastAndroid.SHORT, ToastAndroid.CENTER)
      if (CURRENT_WEB_VIEW_REF) {
        try {
          CURRENT_WEB_VIEW_REF.injectJavaScript(`window.scrollTo({ top: 0 })`)
          CURRENT_WEB_VIEW_REF.reload()
        } catch (error) {
          console.log("App:handle_web_view_message:bookmark_added:error", error)
        }
      }
    }
  }),

  set_current_initial_theme: flow(function* () {
    console.log("App:set_current_theme", Appearance.getColorScheme())
    self.theme = Appearance.getColorScheme()
    App.set_up_appearance_listener()
  }),

  set_up_appearance_listener: flow(function* () {
    console.log("App:set_up_appearance_listener")
    Appearance.addChangeListener(({ colorScheme }) => {
      console.log("App:set_up_appearance_listener:change", colorScheme)
      App.change_current_theme(colorScheme)
    })
  }),

  change_current_theme: flow(function* (color) {
    console.log("App:change_current_theme", color)
    self.is_switching_theme = true
    self.theme = color
    yield App.update_navigation_screens()
    self.is_switching_theme = false
  }),

  update_navigation_screens: flow(function* () {
    console.log("App:update_navigation_screens")
    const options = theme_options({})
    // We set default options here so that any new screen, that might not be in the stack, will pick them up.
    Navigation.setDefaultOptions(options)
    Screens.forEach((_screen, key) => {
      if (key != null &&
        !key.includes("microblog.component") &&
        key !== "__initBottomSheet__")
      {
        console.log("App:update_navigation_screens:screen", key)
        Navigation.mergeOptions(key, options)
      }
    })
  }),

}))
.views(self => ({
  theme_background_color() {
    return self.theme === "dark" ? "#1d2530" : "#fff"
  },
  theme_navigation_icon_color() {
    return self.theme === "dark" ? "#9CA3AF" : "#000"
  },
  theme_text_color() {
    return self.theme === "dark" ? "#fff" : "#000"
  },
  theme_background_color_secondary() {
    return self.theme === "dark" ? "#1F2937" : "#fff"
  },
  theme_navbar_background_color() {
    return self.theme === "dark" ? "#212936" : "#fff"
  },
  theme_button_background_color() {
    return self.theme === "dark" ? "#374151" : "#F9FAFB"
  },
  theme_button_text_color() {
    return self.theme === "dark" ? "#E5E7EB" : "#1F2937"
  },
  theme_section_background_color() {
    return self.theme === "dark" ? "#374151" : "#E5E7EB"
  },
  theme_border_color() {
    return self.theme === "dark" ? "#374151" : "#E5E7EB"
  },
  theme_alt_border_color() {
    return self.theme === "dark" ? "#374151" : "#F9FAFB"
  },
  theme_input_background_color() {
    return self.theme === "dark" ? "#1d2530" : "#f2f2f2"
  },
  theme_opacity_background_color() {
    return self.theme === "dark" ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.6)"
  },
  should_reload_web_view() {
    // When it returns true, this will trigger a reload of the webviews
    return self.is_switching_theme
  },
  now() {
    let now = new Date()
    now.setHours(0, 0, 0, 0)
    return now
  }
}))
.create();
