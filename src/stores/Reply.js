import { types, flow } from 'mobx-state-tree';
import { Alert } from 'react-native'
import MicroBlogApi, { API_ERROR, POST_ERROR } from '../api/MicroBlogApi'
import Auth from './Auth'

export default Reply = types.model('Reply', {
  reply_text: types.optional(types.string, ""),
	is_sending_reply: types.optional(types.boolean, false),
	conversation_id: types.maybeNull(types.string),
})
.actions(self => ({

  hydrate: flow(function* (conversation_id = null) {
    console.log("Reply:hydrate", conversation_id)
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
		self.is_sending_reply = false
  }),
  
  set_reply_text: flow(function* (value) {
		self.reply_text = value
  }),
  
  send_reply: flow(function* () {
		console.log("Reply:send_reply", self.reply_text)
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
  }),
  
  handle_text_action: flow(function* (action, current_selection) {
		console.log("Reply:handle_text_action", action, current_selection)
    const is_link = action === "[]"
    self.reply_text = self.reply_text.InsertTextStyle(action, current_selection, is_link)
  }),

}))
.views(self => ({
  
	replying_enabled() {
		const { selected_user } = Auth
    return selected_user.username != null && selected_user.token() != null
  },
  
  reply_text_length(){
    return self.reply_text.length
  }
  
}))
.create({})