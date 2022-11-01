import { types, flow } from 'mobx-state-tree';
import MicroBlogApi, { API_ERROR } from '../../api/MicroBlogApi';
import Reply from './account/reply'

export default Replies = types.model('Replies', {
  username: types.identifier,
  replies: types.optional(types.array(Reply), []),
  is_loading: types.optional(types.boolean, false),
  selected_reply: types.maybeNull(types.reference(Reply))
})
.actions(self => ({

  hydrate: flow(function* () {
    console.log("Replies:hydrate")
    self.is_loading = true
    const replies = yield MicroBlogApi.get_replies()
    console.log("Replies:hydrate:data", replies)
    if(replies !== API_ERROR && replies.items != null){
      self.replies = replies.items
    }
    self.is_loading = false
  }),
  
  afterCreate: flow(function* () {
    self.hydrate()
  }),
  
  refresh: flow(function* () {
    self.hydrate()
  }),
  
  select_reply: flow(function* (reply) {
    console.log("Reply:select_reply", reply)
    reply.hydrate()
    self.selected_reply = reply
  }),

}))