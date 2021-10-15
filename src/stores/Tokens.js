import { types, flow, applySnapshot } from 'mobx-state-tree';
import Token from './models/Token'
import SFInfo from 'react-native-sensitive-info'

export default Tokens = types.model('Tokens', {
  tokens: types.optional(types.array(Token), [])
})
.actions(self => ({

  hydrate: flow(function* () {
    console.log("Tokens:hydrate")
    const data = yield SFInfo.getItem('Tokens', {})
    if (data) {
      applySnapshot(self, JSON.parse(data))
      console.log("Tokens:hydrate:with_data", data)
    }
  }),
  
  add_new_token: flow(function* (username, token) {
    console.log("Tokens:add_new_token", username, token)
  })

}))
.views(self => ({
}))
.create();