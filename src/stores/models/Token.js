import { types } from 'mobx-state-tree';

export default Token = types.model('Token', {
    token: types.identifier,
    username: types.maybe(types.string),
  })