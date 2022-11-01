import { types, flow } from 'mobx-state-tree';
import MicroPubApi, { POST_ERROR } from './../../../api/MicroPubApi';
import { Alert, Platform } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Auth from '../../Auth';
import App from '../../App';

export default Reply = types.model('Reply', {
  id: types.identifier,
  url: types.maybeNull(types.string),
  content_text: types.maybeNull(types.string),
  date_published: types.maybeNull(types.string),
  _microblog: types.maybe(
    types.model({
      date_relative: types.maybe(types.string)
    })
  ),
  reply_text: types.optional(types.string, ""),
  is_sending_reply: types.optional(types.boolean, false),
  text_selection: types.optional(
    types.model('Selection', {
      start: types.optional(types.number, 0),
      end: types.optional(types.number, 0),
    }), {start: 0, end: 0}
  ),
})
.actions(self => ({
  
  hydrate: flow(function* () {
    self.reply_text = self.content_text
    self.text_selection = {start: 0, end: 0}
    self.is_sending_reply = false
  }),
  
  set_reply_text: flow(function* (value) {
    console.log("Reply:set_reply_text", value)
    self.reply_text = value
  }),
  
  update_reply: flow(function* () {
    console.log("Reply:update_reply", self.reply_text)
    self.is_sending_reply = true
    const data = yield MicroPubApi.post_update(Auth.selected_user.posting.selected_service.service_object(), self.reply_text, self.url)
    console.log("Reply:update_reply:data", data)
    if (data !== POST_ERROR) {
      self.reply_text = ""
      self.is_sending_reply = false
      Auth.selected_user.replies.hydrate()
      App.show_toast("Reply was updated!")
      return true
    }
    else {
      Alert.alert("Whoops", "Could not update reply. Please try again.")
    }
    self.is_sending_reply = false
    return false
  }),
  
  handle_text_action: flow(function* (action) {
    console.log("Reply:handle_text_action", action)
    const is_link = action === "[]"
    if (is_link) {
      action = "[]()"
      let has_web_url = null
      let url = null
      if (Platform.OS === "ios") {
        has_web_url = yield Clipboard.hasWebURL()
      }
      else {
        url = yield Clipboard.getString()
        has_web_url = yield Linking.canOpenURL(url)
        // I'm using this as a fallback, as Android sometimes doesn't know that it can open a URL.
        if (!has_web_url) {
          has_web_url = url.startsWith("http://") || url.startsWith("https://")
        }
      }
      if (has_web_url) {
        if (url === null) {
          url = yield Clipboard.getString()
        }
        action = `[](${ url })`
        self.reply_text = self.reply_text.InsertTextStyle(action, self.text_selection, true, url)
      }
      else {
        self.reply_text = self.reply_text.InsertTextStyle(action, self.text_selection, true)
      }
    }
    else {
      self.reply_text = self.reply_text.InsertTextStyle(action, self.text_selection, is_link)
    }
  }),
  
  set_text_selection: flow(function* (selection) {
    self.text_selection = selection
  }),
}))
.views(self => ({
  relative_date(){
    return self._microblog?.date_relative
  },
  can_edit(){
    // Don't ask...
    const then = new Date(self.date_published)
    const now = new Date()
    const ms_between = Math.abs(then.getTime() - now.getTime())
    const hours_between = ms_between / (60 * 60 * 1000) // min, sec, ms
    
    return hours_between < 24
  },
  replying_enabled() {
    const { selected_user } = Auth
    return selected_user.username != null && selected_user.token() != null
  },
  reply_text_length(){
    return self.reply_text.length
  }
}))