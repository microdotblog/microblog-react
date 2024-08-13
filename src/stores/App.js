import { types, flow } from 'mobx-state-tree';
import { Linking, Appearance, AppState, Platform, Dimensions, Alert } from 'react-native'
import MicroBlogApi, { API_ERROR } from '../api/MicroBlogApi';
import Toast from 'react-native-simple-toast';
import { InAppBrowser } from 'react-native-inappbrowser-reborn'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SheetManager } from "react-native-actions-sheet";

import Auth from './Auth';
import Login from './Login';
import Reply from './Reply';
import Discover from './Discover'
import Settings from "./Settings"
import Services from './Services';
import Contact from './models/posting/Contact'
import Push from './Push'

let SCROLLING_TIMEOUT = null
let CURRENT_WEB_VIEW_REF = null

export default App = types.model('App', {
  is_loading: types.optional(types.boolean, false),
  image_modal_is_open: types.optional(types.boolean, false),
  current_image_url: types.maybeNull(types.string),
  is_scrolling: types.optional(types.boolean, false),
  theme: types.optional(types.string, 'light'),
  is_switching_theme: types.optional(types.boolean, false),
  post_modal_is_open: types.optional(types.boolean, false),
  font_scale: types.optional(types.number, 1),
  is_changing_font_scale: types.optional(types.boolean, false),
  max_characters_allowed: types.optional(types.number, 300),
  enforce_max_characters: types.optional(types.boolean, false),
  current_tab_index: types.optional(types.number, 0),
  terms_url: types.optional(types.string, "https://help.micro.blog/t/terms-of-service/113"),
  privacy_url: types.optional(types.string, "https://help.micro.blog/t/privacy-policy/114"),
  guidelines_url: types.optional(types.string, "https://help.micro.blog/t/community-guidelines/39"),
  found_users: types.optional(types.array(Contact), []),
  current_autocomplete: types.optional(types.string, ""),
  is_share_extension: types.optional(types.boolean, false),
	toolbar_select_destination_open: types.optional(types.boolean, false),
  post_search_is_open: types.optional(types.boolean, false),
  post_search_query: types.optional(types.string, ""),
  is_searching_posts: types.optional(types.boolean, false),
  page_search_is_open: types.optional(types.boolean, false),
  page_search_query: types.optional(types.string, ""),
  is_searching_pages: types.optional(types.boolean, false),
  uploads_search_is_open: types.optional(types.boolean, false),
  uploads_search_query: types.optional(types.string, ""),
  is_searching_uploads: types.optional(types.boolean, false),
  is_loading_highlights: types.optional(types.boolean, false),
  is_loading_bookmarks: types.optional(types.boolean, false),
  conversation_screen_focused: types.optional(types.boolean, false)
})
.volatile(self => ({
  navigation_ref: null,
  current_tab_key: null,
  current_raw_tab_key: null,
}))
.actions(self => ({
  
  set_navigation: flow(function* (navigation = null) {
    if (navigation) {
      self.navigation_ref = navigation
    }
  }),

  hydrate: flow(function* () {
    console.log("App:hydrate")
    self.is_loading = true
    
    Auth.hydrate().then(async () => {
      console.log("App:hydrate:started:is_logged_in", Auth.is_logged_in())
      if(!Auth.is_logged_in()){
        App.navigate_to_screen("Login")
      }
      await App.set_current_initial_theme()
      await App.set_current_initial_font_scale()
      await App.hydrate_last_tab_index()
      Push.hydrate()
      Settings.hydrate()
      App.set_is_loading(false)
      App.set_up_url_listener()
      if (Auth.is_logged_in()) {
        Push.handle_first_notification()
        // Disabled this for now as it's causing some navigation issues
        // if (self.current_tab_index > 0 && self.navigation_ref != null) {
        //   App.navigate_to_tab_index(self.current_tab_index)
        // }
      }
    })
  }),

  prep_and_hydrate_share_extension: flow(function* () {
    console.log("App:prep_and_hydrate_share_extension")
    self.is_share_extension = true
    yield App.set_current_initial_theme()
  }),

  dehydrate_share_extension: flow(function* () {
    console.log("App:dehydrate_share_extension")
    self.is_share_extension = false
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
      else if(event?.url && event?.url.includes('/post?text=') && Auth.is_logged_in()){
        App.navigate_to_screen("Posting", event.url, true)
      }
      else if(event?.url && event?.url.includes('/indieauth') && Auth.is_logged_in()){
        console.log("Micropub:Opened app with IndieAuth")
        Services.check_micropub_credentials_and_proceed_setup(event?.url)
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
      else if(value?.includes('/post?text=') && Auth.is_logged_in()){
        App.navigate_to_screen("Posting", value, true)
      }
    })
  }),
  
  open_sheet: flow(function*(sheet_name = null, payload = null) {
    console.log("App:open_sheet", sheet_name)
    if (sheet_name != null) {
      const sheet_is_open = SheetManager.get(sheet_name)?.current?.isOpen()
      if (!sheet_is_open) {
        SheetManager.show(sheet_name, { payload: payload })
      }
    }
  }),
  
  close_sheet: flow(function*(sheet_name = null) {
    console.log("App:close_sheet", sheet_name)
    if (sheet_name != null) {
      SheetManager.hide(sheet_name)
    }
  }),
  
  close_all_sheets: flow(function*() {
    console.log("App:close_all_sheets")
    SheetManager.hideAll()
  }),

  set_current_tab_key: flow(function* (tab_key) {
    console.log("App:set_current_tab_key", tab_key)
    self.current_raw_tab_key = tab_key
    if (tab_key.includes("Timeline")) {
      self.current_tab_key = "Timeline"
    }
    else if (tab_key.includes("Mentions")) {
      self.current_tab_key = "Mentions"
    }
    else if (tab_key.includes("Bookmarks")) {
      self.current_tab_key = "Bookmarks"
      if(Auth.is_logged_in() && Auth.selected_user != null){
        Auth.selected_user.fetch_highlights()
        Auth.selected_user.fetch_tags()
        Auth.selected_user.fetch_recent_tags()
      }
    }
    else if (tab_key.includes("Discover")) {
      self.current_tab_key = "Discover"
      Discover.shuffle_random_emoji()
    }
    else {
      self.current_tab_key = tab_key
    }
  }),

  set_conversation_screen_focused: flow(function* (focused = true) {
    self.conversation_screen_focused = focused
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
          else if (action === "tag"){
            Auth.selected_user?.fetch_tags_for_bookmark(action_data)
            App.open_sheet("add_tags_sheet")
          }
        }
      }
    }
  }),
  
  navigate_to_screen: flow(function*(screen_name = null, action_data = null, from_listener = false) {
    console.log("App:navigate_to_screen", screen_name)
    if (screen_name != null && self.navigation_ref != null && !self.is_scrolling) {
      switch (screen_name) {
        case "photo":
          return App.set_image_modal_data_and_activate(action_data)
        case "reply":
          Reply.hydrate(action_data)
          return self.navigation_ref.push("Reply", { conversation_id: action_data })
        case "user":
          return self.navigation_ref.push(`${self.current_tab_key}-Profile`, { username: action_data })
        case "discover/topic":
          return self.navigation_ref.push("DiscoverTopic", { topic: action_data })
        case "open":
          Reply.hydrate(action_data)
          Push.check_and_remove_notifications_with_post_id(action_data)
          if (self.conversation_screen_focused) {
            return self.navigation_ref.navigate(`${self.current_tab_key}-Conversation`, { conversation_id: action_data })
          }
          return self.navigation_ref.push(`${self.current_tab_key}-Conversation`, { conversation_id: action_data })
        case "post_service":
          yield Services.hydrate_with_user(action_data)
          return self.navigation_ref.push("PostService", { user: action_data })
        case "add_bookmark":
          return self.navigation_ref.push("AddBookmark")
        case "highlights":
          return self.navigation_ref.push("Highlights")
        case "bookmark":
          return self.navigation_ref.push("Bookmark", { bookmark_id: action_data })
        case "following":
          return self.navigation_ref.push(`${self.current_tab_key}-Following`, { username: action_data })
        case "uploads":
          return self.navigation_ref.push(`${self.current_tab_key}-Uploads`)
        case "replies":
          return self.navigation_ref.push(`${self.current_tab_key}-Replies`)
        case "reply_edit":
          return self.navigation_ref.push("ReplyEdit")
        case "PageEdit":
          Auth.selected_user?.posting.hydrate_page_edit(action_data)
          return self.navigation_ref.push("PageEdit")
        case "Posts":
          return self.navigation_ref.push(`${ self.current_tab_key }-Posts`)
        case "Pages":
          return self.navigation_ref.push(`${ self.current_tab_key }-Pages`)
        case "Posting":
          if (action_data != null && !from_listener) {
            // Action data is usually markdown text from a highlight,
            // unless it's from the url listener.
            Auth.selected_user?.posting.hydrate_post_with_markdown(action_data)
          }
          else if (action_data != null && from_listener) {
            Auth.selected_user.posting.set_post_text_from_action(action_data)
          }
          return self.navigation_ref.push("Posting")
        case "PostEdit":
          Auth.selected_user?.posting.hydrate_post_edit(action_data)
          return self.navigation_ref.push("PostEdit")
        case "ImageOptions":
          return self.navigation_ref.push("ImageOptions", action_data)
        case "PostUploads":
          return self.navigation_ref.push(`PostUploads`, { did_open_from_editor: true })
        default:
          self.navigation_ref.push(screen_name)
      }
    }
  }),
  
  go_back: flow(function*() {
    console.log("App:go_back")
    if (self.navigation_ref != null && self.navigation_ref.canGoBack()) {
      self.navigation_ref.goBack()
    }
  }),

  navigate_to_screen_from_menu: flow(function* (screen) {
    console.log("App:navigate_to_screen_from_menu", screen)
    App.close_sheet("main_sheet")
    switch (screen) {
      case "Help":
        return self.navigate_to_screen("Help")
      case "Settings":
        return self.navigate_to_screen("Settings")
      case "Replies":
        return self.navigate_to_screen("replies")
      case "Posts":
        return self.navigate_to_screen("Posts")
      case "Pages":
        return self.navigate_to_screen("Pages")
      case "Uploads":
        return self.navigate_to_screen("uploads")
      case "PostService":
        return self.navigate_to_screen("post_service", Auth.selected_user)
    }
    console.log("App:navigate_to_screen_from_menu:index", screen, tab_index, self.current_screen_id, should_pop)
    if(tab_index != null){
      App.navigate_to_tab_index(tab_index)
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
      
      if(after_mb_link.includes("hybrid/conversation")){
        return
      }
      
      if(after_mb_link.includes("hybrid/discover")){
        App.navigate_to_screen_from_menu("Discover")
        return
      }
      
      if(parts.length === 3 && parts[0] === 'discover' && parts[1] !== null && parts[2] === "grid"){
        App.open_url(url)
      }
      else if(parts.length === 2){
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
              const topic = Discover.topic_by_slug(parts[1])
              if(topic != null){
                App.navigate_to_screen("discover/topic", topic)
              }
              else{
                App.open_url(url)
              }
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
      else if(parts?.length >= 2 && parts[0] === "account"){
        App.open_url(url, true)
      }
      else if (parts?.length >= 4) {
        App.open_url(url)
      }
      else if (parts?.length === 1 && (parts[0] === "summer" || parts[0] === "about")){
        App.open_url(url)
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

  open_url: flow(function* (url, open_external = false) {    
    const is_mailto = url.includes("mailto:")
    if (is_mailto) {
      Linking.openURL(url)
    }
    else {
      Linking.canOpenURL(url).then(async (supported) => {
        if (supported) {
          const is_inapp_browser_avail = await InAppBrowser.isAvailable()
          if (is_inapp_browser_avail && !open_external && !Settings.open_links_in_external_browser) {
            return InAppBrowser.open(url, {
              dismissButtonStyle: 'close',
              preferredControlTintColor: "#f80",
              readerMode: Settings.open_links_with_reader_mode,
              animated: true,
              modalEnabled: false
            })
          }
          else {
            Linking.openURL(url);
          }
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
    }
  }),

  set_current_web_view_ref: flow(function* (current_ref) {
    console.log("App:set_current_web_view_ref")
    CURRENT_WEB_VIEW_REF = current_ref
  }),

  handle_web_view_message: flow(function* (message) {
    console.log("App:handle_web_view_message", message)
    if (message === "bookmark_added") {
      Toast.showWithGravity("Bookmark added!", Toast.SHORT, Toast.CENTER)
    }
    else if (message === "bookmark_removed") {
      Toast.showWithGravity("Bookmark removed!", Toast.SHORT, Toast.CENTER)
    }
    if (message === "bookmark_removed") {
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
      setTimeout(() => {
        Toast.showWithGravity("Bookmark added!", Toast.SHORT, Toast.CENTER)
      }, Platform.OS === 'ios' ? 350 : 0)
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

  scroll_web_view_to_top: flow(function* (target) {
    // TODO: Make sure to scroll web view to top if on current tab
    console.log("App:scroll_web_view_to_top", target, self.current_raw_tab_key)
    if (target != null && self.current_raw_tab_key == target) {
      try {
        CURRENT_WEB_VIEW_REF.injectJavaScript(`window.scrollTo({ top: 0, behavior: 'smooth' })`)
      } catch (error) {
        console.log("App:scroll_web_view_to_top:error", error)
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
    AppState.addEventListener("change", nextAppState => {
      if (nextAppState === "active") {
        const colorScheme = Appearance.getColorScheme()
        if (self.theme !== colorScheme){
          App.change_current_theme(colorScheme)
        }
      }
    })
    Appearance.addChangeListener(({ colorScheme }) => {
      if (AppState.currentState === "background" || AppState.currentState === "inactive") {
        return
      }
      console.log("App:set_up_appearance_listener:change", colorScheme)
      App.change_current_theme(colorScheme)
    })
  }),

  change_current_theme: flow(function* (color) {
    console.log("App:change_current_theme", color)
    self.is_switching_theme = true
    self.theme = color
    self.is_switching_theme = false
  }),
  
  set_current_initial_font_scale: flow(function* () {
    console.log("App:set_current_initial_font_scale", Dimensions.get("screen")?.fontScale)
    let font_scale = Dimensions.get("screen")?.fontScale
    self.font_scale = font_scale ?? self.font_scale
    App.set_up_font_scale_listener()
  }),
  
  set_up_font_scale_listener: flow(function* () {
    console.log("App:set_up_font_scale_listener")
    Dimensions.addEventListener(
      "change",
      ({ screen }) => {
        console.log("App:set_up_font_scale_listener:change", screen?.fontScale)
        if(screen?.fontScale !== self.font_scale){
          App.change_font_scale(screen?.fontScale)
        }
      }
    );
  }),
  
  change_font_scale: flow(function* (font_scale) {
    console.log("App:change_font_scale", font_scale)
    self.is_changing_font_scale = true
    self.font_scale = font_scale
    // We need a timeout here so that it actually triggers the web views to reload.
    setTimeout(() => {
      App.set_is_changing_font_scale()
    }, 100)
  }),
  
  set_is_changing_font_scale: flow(function* (is_loading = false) {
    console.log("App:set_is_changing_font_scale", is_loading)
    self.is_changing_font_scale = is_loading
  }),
  
  show_toast: flow(function* (message) {
    console.log("App:show_toast", message)
    setTimeout(() => {
      Toast.showWithGravity(message, Toast.SHORT, Toast.CENTER)
    }, Platform.OS === 'ios' ? 350 : 0)
  }),
  
  set_current_tab_index: flow(function* (tab_index) {
    console.log("App:set_current_tab_index", tab_index)
    if(tab_index === self.current_tab_index){return}
    self.current_tab_index = tab_index
    AsyncStorage.setItem("App:tab_index", JSON.stringify(self.current_tab_index))
  }),
  
  hydrate_last_tab_index: flow(function* () {
    console.log("App:hydrate_last_tab_index")
    const last_tab_index = yield AsyncStorage.getItem("App:tab_index")
    if(last_tab_index != null){
      const tab_index = JSON.parse(last_tab_index)
      console.log("App:hydrate_last_tab_index:tab_index", tab_index)
      if(tab_index != null){
        self.current_tab_index = tab_index
      }
    }
  }),
  
  navigate_to_tab_index: flow(function* (tab_index) {
    console.log("App:navigate_to_tab_index", tab_index)
    const tab_names = ['TimelineStack', 'MentionsStack', 'BookmarksStack', 'DiscoverStack']
    const target_tab = tab_names[ tab_index ]
    if (target_tab != null) { 
      self.navigation_ref.navigate(target_tab)
    }
  }),

  check_usernames: flow(function* (text) {
    const s = text
    
    // for a quick test, we're just going to grab usernames regardless of insertion point
    // later, will be smarter about only checking the username that is being typed
    // TODO: use Posting.text_selection
    
    const regex = /\@([a-z][A-Z]*)/ig
    const pieces = s.match(regex)
    if (pieces != null) {
      const username = pieces[pieces.length - 1].substr(1) // get rid of @
      if (username.length >= 3) {
        // make sure this is at the end of the text for now
        const len = s.length
        const offset = s.indexOf(username)
        if ((len - username.length) == offset) {
          // query the server
          const results = yield MicroBlogApi.find_users(username)
          if (results !== API_ERROR && results.contacts != null) {
            self.found_users = []
            self.current_autocomplete = username
            for (var c of results.contacts) {
              const u = Contact.create({
                username: c.nickname,
                avatar: c.photo
              })
              self.found_users.push(u)
            }
          }
        }
        else {
          self.found_users = []
        }
      }
    }
    else {
      self.found_users = []
    }
  }),
  
  update_autocomplete: flow(function* (selected_username, obj) {
    var s = obj.post_text
    if (s == undefined) {
      s = obj.reply_text
    }
    s = s.replace("@" + App.current_autocomplete, "@" + selected_username + " ")
    if (obj.reply_text != undefined) {
      obj.set_reply_text(s)
    }
    else {
      obj.set_post_text(s)
    }
    App.found_users = []
    App.current_autocomplete = ""
  }),

  toggle_select_destination: flow(function* () {
    console.log("App:toggle_select_destination")
    self.toolbar_select_destination_open = !self.toolbar_select_destination_open
  }),
  
  toggle_post_search_is_open: flow(function* () {
    console.log("App:toggle_post_search_is_open")
    self.post_search_is_open = !self.post_search_is_open
  }),
  
  toggle_page_search_is_open: flow(function* () {
    console.log("App:toggle_page_search_is_open")
    self.page_search_is_open = !self.page_search_is_open
  }),

  toggle_uploads_search_is_open: flow(function* () {
    console.log("App:toggle_uploads_search_is_open")
    self.uploads_search_is_open = !self.uploads_search_is_open
  }),
  
  set_posts_query: flow(function* (text, destination) {
    console.log("App:set_posts_query", text)
    self.post_search_query = text
    if(text?.length > 2){
      self.is_searching_posts = true
      const results = yield MicroBlogApi.search_posts_and_pages(text, destination?.uid, false)
      if(results !== API_ERROR && results.items != null){
        destination.set_posts(results.items)
      }
      self.is_searching_posts = false
    }
    else if(self.post_search_query == ""){
      Auth.selected_user.posting?.selected_service?.update_posts_for_active_destination()
    }
  }),
  
  set_pages_query: flow(function* (text, destination) {
    console.log("App:set_pages_query", text)
    self.page_search_query = text
    if(text?.length > 2){
      self.is_searching_pages = true
      const results = yield MicroBlogApi.search_posts_and_pages(text, destination?.uid, true)
      if(results !== API_ERROR && results.items != null){
        destination.set_pages(results.items)
      }
      self.is_searching_pages = false
    }
    else if(self.page_search_query == ""){
      Auth.selected_user.posting?.selected_service?.update_pages_for_active_destination()
    }
  }),

  set_uploads_query: flow(function* (text, destination) {
    console.log("App:set_uploads_query", text)
    self.uploads_search_query = text
    if(text?.length > 2){
      self.is_searching_uploads = true
      const results = yield MicroBlogApi.search_uploads(text, destination?.uid)
      if(results !== API_ERROR && results.items != null){
        destination.set_uploads(results.items)
      }
      self.is_searching_uploads = false
    }
    else if(self.uploads_search_query == ""){
      Auth.selected_user.posting?.selected_service?.update_uploads_for_active_destination()
    }
  }),
  
  set_is_loading_highlights: flow(function* (loading) {
    console.log("App:set_is_loading_highlights", loading)
    self.is_loading_highlights = loading
  }),
  
  trigger_logout_for_user: flow(function* (user) {
    console.log("App:trigger_logout_for_user")
    Alert.alert(`Please sign in again`, `Your token for, @${user.username}, is no longer valid.`)
    yield Auth.logout_user(user)
    App.navigate_to_screen("Login")
  }),
  
  set_is_loading_bookmarks: flow(function* (loading) {
    console.log("App:set_is_loading_bookmarks", loading)
    self.is_loading_bookmarks = loading
  }),

}))
.views(self => ({
  is_dark_mode() {
    return self.theme === "dark"
  },
  theme_accent_color(){
    return "#f80"
  },
  theme_warning_text_color(){
    return "red"
  },
  theme_background_color() {
    return self.theme === "dark" ? "#1d2530" : "#fff"
  },
  theme_navigation_icon_color() {
    return self.theme === "dark" ? "#9CA3AF" : "#000"
  },
  theme_text_color() {
    return self.theme === "dark" ? "#fff" : "#000"
  },
  theme_placeholder_text_color() {
    return self.theme === "dark" ? "#374151" : "lightgray"
  },
  theme_placeholder_alt_text_color() {
    return self.theme === "dark" ? "rgba(255,255,255,0.6)" : "lightgray"
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
  theme_button_disabled_background_color() {
    return self.theme === "dark" ? "#272d37" : "#F9FAFB"    
  },
  theme_button_disabled_text_color() {
    return self.theme === "dark" ? "#a1a3a5" : "#4e6180"
  },
  theme_section_background_color() {
    return self.theme === "dark" ? "#374151" : "#E5E7EB"
  },
  theme_header_button_background_color() {
    return self.theme === "dark" ? "#27303d" : "#f8f8f8"
  },
  theme_border_color() {
    return self.theme === "dark" ? "#374151" : "#E5E7EB"
  },
  theme_alt_border_color() {
    return self.theme === "dark" ? "#374151" : "#F9FAFB"
  },
  theme_alt_background_div_color() {
    return self.theme === "dark" ? "#5a5a5a" : "#eff1f3"
  },
  theme_input_background_color() {
    return self.theme === "dark" ? "#1d2530" : "#f2f2f2"
  },
  theme_input_contrast_background_color() {
    return self.theme === "dark" ? "#171c24" : "#f2f2f2"
  },
  theme_input_contrast_alt_background_color() {
    return self.theme === "dark" ? "#171c24" : "#F9FAFB"
  },
  theme_opacity_background_color() {
    return self.theme === "dark" ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.6)"
  },
  theme_chars_background_color() {
    return self.theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.6)"
  },
  theme_settings_group_background_color() {
    return self.theme === "dark" ? "#1F2937" : "#eff1f3"
  },
  theme_autocomplete_background_color() {
    return self.theme === "dark" ? "#1c2028" : "#f4f6f8"
  },
  theme_crop_button_text_color() {
    return self.theme === "dark" ? "#E5E7EB" : "#000000"
  },
  theme_crop_button_background_color() {
    return self.theme === "dark" ? "#374151" : "#d9dadb"
  },
  theme_crop_background_color() {
    return self.theme === "dark" ? "#000000" : "#e5e5e5"    
  },
  theme_filters_background_color() {
    return self.theme === "dark" ? "#374151" : "#e5e5e5"    
  },
  theme_selected_button_color() {
    return self.theme === "dark" ? "#1c2028" : "#F9FAFB"
  },
  theme_error_background_color() {
    return self.theme === "dark" ? "#a94442" : "#f2dede"
  },
  theme_error_text_color() {
    return self.theme === "dark" ? "#f2dede" : "#a94442"
  },
  theme_profile_button_text_color() {
    return self.theme === "dark" ? "#FFFFFF" : "#000000"
  },
  theme_profile_button_background_color() {
    return self.theme === "dark" ? "#212936" : "#EFEFEF"
  },
  theme_highlight_background_color(){
    return self.theme === "dark" ? "#1F2937" : "rgb(254,249,195)"
  },
  theme_highlight_border_color(){
    return self.theme === "dark" ? "#f2dede" : "rgb(254,240,138)"
  },
  theme_highlight_meta_text_color() {
    return "gray"
  },
  theme_default_font_size(){
    return 17
  },
  theme_tag_button_background_color() {
    return self.theme === "dark" ? "#F9FAFB" : "#374151"
  },
  theme_tag_button_text_color() {
    return self.theme === "dark" ? "#374151" : "#F9FAFB"
  },
  should_reload_web_view() {
    // When it returns true, this will trigger a reload of the webviews
    return self.is_switching_theme || self.is_changing_font_scale
  },
  now() {
    let now = new Date()
    now.setHours(0, 0, 0, 0)
    return now.getTime()
  },
  web_font_scale(){
    return App.font_scale > 2 ? 2 : App.font_scale
  },
  navigation(){
    return self.navigation_ref
  }
}))
.create();
