import { types, flow, destroy } from 'mobx-state-tree';
import MicroBlogApi, { API_ERROR, DELETE_ERROR } from '../api/MicroBlogApi';
import Reply from './models/Reply'
import App from './App'
import { Alert } from 'react-native';
import Auth from './Auth';

export default Replies = types.model('Replies', {
  current_username: types.maybeNull(types.string),
  replies: types.optional(types.array(Reply), []),
  is_loading: types.optional(types.boolean, false),
  selected_reply: types.maybeNull(types.reference(Reply))
})
.actions(self => ({

  hydrate: flow(function* () {
    console.log("Replies:hydrate")
    if(self.current_username == null || self.current_username !== Auth.selected_user?.username){
      self.replies = []
      self.current_username = Auth.selected_user?.username
    }
    self.selected_reply = null
    self.is_loading = true
    const replies = yield MicroBlogApi.get_replies()
    if(replies !== API_ERROR && replies.items != null){
      self.replies = replies.items
    }
    self.is_loading = false
  }),
  
  refresh: flow(function* () {
    self.hydrate()
  }),
  
  select_reply_and_open_edit: flow(function* (reply) {
    console.log("Reply:select_reply", reply)
    self.selected_reply = reply
    App.navigate_to_screen("reply_edit")
  }),
  
  delete_reply: flow(function* (reply) {
    console.log("Reply:delete_reply", reply)
    const reply_id = reply.id
    destroy(reply)
    const status = yield MicroBlogApi.delete_post(reply_id)
    if(status !== DELETE_ERROR){
      App.show_toast("Reply was deleted.")
      self.hydrate()
    }
    else{
      Alert.alert("Whoops", "Could not delete reply. Please try again.")
      self.hydrate()
      self.is_loading = false
    }
  }),
  
}))
.create({})