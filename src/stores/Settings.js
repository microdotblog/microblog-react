import { types, flow, applySnapshot } from 'mobx-state-tree';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default Settings = types.model('Settings', {
  open_links_in_external_browser: types.optional(types.boolean, false)
})
.actions(self => ({

  hydrate: flow(function* () {
    console.log("Settings:hydrate")
    const data = yield AsyncStorage.getItem('Settings')
    if (data) {
      applySnapshot(self, JSON.parse(data))
      console.log("Settings:hydrate:with_data")
    }
  })
  
}))
.create();