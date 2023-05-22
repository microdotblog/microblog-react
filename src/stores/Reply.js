import { types, flow } from 'mobx-state-tree';
import { Alert, Platform } from 'react-native'
import MicroBlogApi, { API_ERROR, POST_ERROR } from '../api/MicroBlogApi'
import Auth from './Auth'
import Clipboard from '@react-native-clipboard/clipboard';
import md from 'markdown-it';
const parser = md();

export default Reply = types.model('Reply', {
  reply_text: types.optional(types.string, ""),
	is_sending_reply: types.optional(types.boolean, false),
	conversation_id: types.maybeNull(types.string),
	text_selection: types.optional(
    types.model('Selection', {
      start: types.optional(types.number, 0),
      end: types.optional(types.number, 0),
    }), {start: 0, end: 0}
  ),
})
.actions(self => ({

  hydrate: flow(function* (conversation_id = null) {
		console.log("Reply:hydrate", conversation_id)
		if (conversation_id !== self.conversation_id || self.reply_text === "") {
			self.reply_text = ""
			const data = yield MicroBlogApi.get_conversation(conversation_id)
			if (data !== API_ERROR && data.items) {
				self.conversation_id = conversation_id
				const conversation = data.items.find(post => post.id === conversation_id)
				console.log("Reply:hydrate:conversation", conversation)
				if(conversation && conversation.author?._microblog?.username != null){
					self.reply_text = `@${conversation.author._microblog.username} `
				}
				else {
					// Load the first post in the conversation, which is at the end of the array
					const first_post = data.items[ data.items.length - 1 ]
					if (first_post && first_post.author?._microblog?.username != null) {
						self.reply_text = `@${first_post.author._microblog.username} `
					}
				}
			}
		}
		self.is_sending_reply = false
  }),
  
  set_reply_text: flow(function* (value) {
		self.reply_text = value
  }),

  set_reply_text_from_typing: flow(function* (value) {
    self.reply_text = value
    App.check_usernames(self.reply_text)
  }),
  
  send_reply: flow(function* () {
		console.log("Reply:send_reply", self.reply_text)
    if(!self.is_sending_reply && self.reply_text !== " " && App.enforce_max_characters ? self.reply_text_length() <= App.max_characters_allowed : true){
      self.is_sending_reply = true
      const data = yield MicroBlogApi.send_reply(self.conversation_id, self.reply_text)
      console.log("Reply:send_reply:data", data)
      if (data !== POST_ERROR) {
        self.reply_text = ""
        self.is_sending_reply = false
        return true
      }
      else {
        Alert.alert("Whoops", "Could not send reply. Please try again.")
      }
      self.is_sending_reply = false
      return false
    }
    if(self.reply_text_length() > App.max_characters_allowed && App.enforce_max_characters){
      Alert.alert("Whoops", "Your reply is too long. Either shorten it, or consider writing a blog post instead.")
    }
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
      console.log("HAS WEB URL", url, has_web_url)
      if (has_web_url) {
        if (url === null) {
          url = yield Clipboard.getString()
        }
        action = `[](${ url })`
        console.log("TEXT OPTION", action)
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
  
	replying_enabled() {
		const { selected_user } = Auth
    return selected_user.username != null && selected_user.token() != null
  },
  
  reply_text_length(){
    const html = parser.render(self.reply_text)
    const regex = /(<([^>]+)>)/ig
    const text = html.replace(regex, '')
    return text ? text.length : 0
  }
  
}))
.create({})