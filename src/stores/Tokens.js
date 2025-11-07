import { types, flow, applySnapshot, destroy } from 'mobx-state-tree';
import Token from './models/Token'
import SFInfo from 'react-native-sensitive-info'
import * as SecureStore from 'expo-secure-store';

export default Tokens = types.model('Tokens', {
  tokens: types.optional(types.array(Token), [])
})
.actions(self => ({

  hydrate: flow(function* (return_data = false) {
    console.log("Tokens:hydrate")
    const data = yield SFInfo.getItem('Tokens', {}) // TODO: Replace with when the time comes: yield SecureStore.getItemAsync('Tokens')
    if (data) {
      applySnapshot(self, JSON.parse(data))
      console.log("Tokens:hydrate:with_data")
    }
    if(return_data){
      return data ? JSON.parse(data) : null
    }
  }),
  
  destroy_all_token_data: flow(function* () {
    console.log("Tokens:destroy_all_token_data")
    yield SFInfo.deleteItem("Tokens", {})
    yield SecureStore.deleteItemAsync("Tokens")
  }),
  
  add_new_token: flow(function* (username, token) {
    console.log("Tokens:add_new_token", username)
    const existing_token = self.tokens.find(t => t.username === username && t.type === "user")
    if(existing_token != null){
      // There might be an existing token for a given user, but the token changed.
      // Destroying it so we can create a new one as the identifier is tied to the token.
      destroy(existing_token)
    }
    const new_token = Token.create({token: token, username: username})
    self.tokens.push(new_token)
    return new_token
  }),
  
  destroy_token: flow(function* (username) {
    console.log("Tokens:destroy_token", username)
    const existing_token = self.tokens.find(t => t.username === username && t.type === "user")
    if(existing_token != null){
      destroy(existing_token)
    }
  }),
  
  destroy_token_for_service_id: flow(function* (service_id) {
    console.log("Tokens:destroy_token_for_service_id", service_id)
    const existing_token = self.tokens.find(t => t.service_id === service_id && t.type === "service")
    if(existing_token != null){
      destroy(existing_token)
    }
  }),
  
  create_new_service_token: flow(function* (username, password, service_id) {
    console.log("Tokens:create_new_service_token", username, service_id)
    const existing_token = self.tokens.find(t => t.service_id === service_id)
    if(existing_token != null){
      // There might be an existing token for a given user, but the token changed.
      // Destroying it so we can create a new one as the identifier is tied to the token.
      destroy(existing_token)
    }
    const new_token = Token.create({token: password, username: username, service_id: service_id, type: "service"})
    self.tokens.push(new_token)
    return new_token
  }),

}))
.views(self => ({
  
  token_for_username(username, type = "user"){
    return self.tokens.find(t => t.username === username && t.type === type)
  },
  
  token_for_service_id(service_id){
    return self.tokens.find(t => t.service_id === service_id)
  }
  
}))
.create();
