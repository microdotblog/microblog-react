import { types, flow } from 'mobx-state-tree';
import MicroPubApi, { POST_ERROR } from './../../../api/MicroPubApi';

export default Reply = types.model('Reply', {
  id: types.identifier
})
.actions(self => ({

}))