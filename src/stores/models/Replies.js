import { types, flow } from 'mobx-state-tree';
import MicroBlogApi, { API_ERROR } from '../../api/MicroBlogApi';
import App from '../App'
import Reply from './account/reply'

export default Replies = types.model('Replies', {
  username: types.identifier,
  replies: types.optional(types.array(Reply), [])
})
.actions(self => ({

  hydrate: flow(function* () {
    console.log("Replies:hydrate")
    const replies = yield MicroBlogApi.get_replies()
    console.log("Replies:hydrate:data", replies)
  }),
  
  afterCreate: flow(function* () {
    self.hydrate()
  })

}))