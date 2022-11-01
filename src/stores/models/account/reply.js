import { types, flow } from 'mobx-state-tree';
import MicroPubApi, { POST_ERROR } from './../../../api/MicroPubApi';

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
})
.actions(self => ({

}))
.views(self => ({
  relative_date(){
    return self._microblog?.date_relative
  }
}))