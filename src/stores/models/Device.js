import { types } from 'mobx-state-tree';

export default Device = types.model('Device', {
  token: types.identifier,
  app_name: types.maybe(types.string),
  push_env: types.maybe(types.string),
  created_at: types.maybe(types.string),
})
