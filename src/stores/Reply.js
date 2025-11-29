import { types, flow } from 'mobx-state-tree';
import { Alert, Platform, Linking } from 'react-native'
import MicroBlogApi, { API_ERROR, POST_ERROR, DUPLICATE_REPLY, CURRENT_REPLY_ID } from '../api/MicroBlogApi'
import Auth from './Auth'
import Clipboard from '@react-native-clipboard/clipboard';
import { SheetManager } from 'react-native-actions-sheet';
import md from 'markdown-it';
const parser = md();

export default Reply = types.model('Reply', {
  reply_text: types.optional(types.string, ""),
	is_sending_reply: types.optional(types.boolean, false),
	conversation_id: types.maybeNull(types.string),
	show_back_button: types.optional(types.boolean, false),
	is_sheet_open: types.optional(types.boolean, false),
	text_selection: types.optional(
    types.model('Selection', {
      start: types.optional(types.number, 0),
      end: types.optional(types.number, 0),
    }), {start: 0, end: 0}
  ),
  reply_id: types.optional(types.number, new Date().getTime()),
  conversation_users: types.optional(types.array(types.model({ username: types.string, avatar: types.maybeNull(types.string) })), []),
  conversation_usernames: types.optional(types.array(types.string), []),
  is_loading_conversation: types.optional(types.boolean, false)
})
.actions(self => ({

  hydrate: flow(function* (conversation_id = null) {
    const reply_sheet_is_open = SheetManager.get('reply_sheet')?.current?.isOpen()
    if (reply_sheet_is_open) {
      if (conversation_id !== self.conversation_id) {
        self.show_back_button = true
      }
      return
    }
    
    self.show_back_button = false
    
    self.is_loading_conversation = true
    try {
      console.log("Reply:hydrate", conversation_id)
      self.reply_id = new Date().getTime()
      if (conversation_id !== self.conversation_id || self.reply_text === "") {
        self.reply_text = ""
        const data = yield MicroBlogApi.get_conversation(conversation_id)
        if (data !== API_ERROR && data.items) {
          self.conversation_id = conversation_id

          const users = []
          const seen = new Set()
          data.items.forEach(post => {
            const username = post.author?._microblog?.username
            const avatar = post.author?.avatar
            if (username && !seen.has(username)) {
              users.push({ username, avatar })
              seen.add(username)
            }
          })
          self.conversation_users = users
          self.conversation_usernames = users.map(u => u.username)
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
      console.log("Reply:hydrate:reply_id", self.reply_id)
    } finally {
      self.is_loading_conversation = false
    }
  }),
  
  set_reply_text: flow(function* (value) {
		self.reply_text = value
  }),

  set_reply_text_from_typing: flow(function* (value) {
    self.reply_text = value
    App.check_usernames(self.reply_text)
  }),
  
  set_sheet_open: flow(function* (value = false) {
    self.is_sheet_open = value
  }),
  
  send_reply: flow(function* () {
		console.log("Reply:send_reply", self.reply_text)
    if(self.reply_id !== CURRENT_REPLY_ID && !self.is_sending_reply && self.reply_text !== " " && App.enforce_max_characters ? self.reply_text_length() <= App.max_characters_allowed : true){
      self.is_sending_reply = true
      const data = yield MicroBlogApi.send_reply(self.conversation_id, self.reply_text, self.reply_id)
      console.log("Reply:send_reply:data", data)
      // Because it might already be sending a reply, we should get back
      // a DUPLICATE_REPLY status. In that case, assume all is good (I know, bad!) (TODO: handle later on).
      if (data !== POST_ERROR || data === DUPLICATE_REPLY) {
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

  add_mention: flow(function* (username) {
    const current = self.reply_text.trim()
    const mention = `@${username}`
    if (!current.includes(mention)) {
      yield self.set_reply_text(`${current} ${mention} `)
    }
  }),

  remove_mention: flow(function* (username) {
    const mention = `@${username}`
    const updatedText = self.reply_text
      .replace(new RegExp(`\\s*${mention}\\s*`, 'g'), ' ')
      .replace(/\s+/g, ' ')
      .trim()
    yield self.set_reply_text(updatedText ? `${updatedText} ` : '')
  }),

  toggle_mention: flow(function* (username) {
    if (self.is_user_mentioned(username)) {
      yield self.remove_mention(username)
    } else {
      yield self.add_mention(username)
    }
  }),

  add_user_to_conversation: flow(function* (username, avatar = null) {
    const userExists = self.conversation_users.find(u => u.username === username)
    if (!userExists) {
      self.conversation_users.push({ username, avatar })
      self.conversation_usernames.push(username)
    }
  }),

  navigate_to_conversation: flow(function* () {
    if (self.conversation_id) {
      const App = require('./App').default
      if (App.conversation_screen_focused) {
        App.navigation_ref.navigate(`${App.current_tab_key}-Conversation`, { conversation_id: self.conversation_id })
      }
      else {
        App.navigation_ref.push(`${App.current_tab_key}-Conversation`, { conversation_id: self.conversation_id })
      }      
      self.show_back_button = false
    }
  }),

  reply_all: flow(function* () {
    const current = self.reply_text.trim()
    const existingMentions = new Set()
    
    const mentionRegex = /@(\w+)/g
    let match
    while ((match = mentionRegex.exec(current)) !== null) {
      existingMentions.add(match[1])
    }
    
    const newMentions = self.conversation_users
      .filter(u => !existingMentions.has(u.username))
      .map(u => `@${u.username}`)
      .join(' ')
    
    if (newMentions) {
      const separator = current ? ' ' : ''
      yield self.set_reply_text(`${current}${separator}${newMentions} `)
    }
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
  },

  is_user_mentioned(username) {
    const mentionRegex = new RegExp(`@${username}\\b`, 'i')
    return mentionRegex.test(self.reply_text)
  },

  sorted_conversation_users() {
    const mentionedUsers = []
    const unmentionedUsers = []
    
    const mentionRegex = /@(\w+)/g
    const mentionOrder = []
    let match
    while ((match = mentionRegex.exec(self.reply_text || '')) !== null) {
      if (!mentionOrder.includes(match[1])) {
        mentionOrder.push(match[1])
      }
    }
    
    self.conversation_users.forEach(user => {
      const isAlreadyMentioned = self.is_user_mentioned(user.username)
      if (isAlreadyMentioned) {
        mentionedUsers.push(user)
      } else {
        unmentionedUsers.push(user)
      }
    })
    
    mentionedUsers.sort((a, b) => {
      const indexA = mentionOrder.indexOf(a.username)
      const indexB = mentionOrder.indexOf(b.username)
      return indexA - indexB
    })
    
    return [...mentionedUsers, ...unmentionedUsers]
  }
  
}))
.create({})
