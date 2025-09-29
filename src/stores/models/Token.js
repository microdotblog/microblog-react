import { types } from 'mobx-state-tree';

export default Token = types.model('Token', {
  token: types.identifier,
  username: types.maybe(types.string),
  type: types.optional(types.string, "user"),
  service_id: types.maybe(types.string),
})
