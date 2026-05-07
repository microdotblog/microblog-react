import { types, flow, applySnapshot } from 'mobx-state-tree';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default Settings = types.model('Settings', {
  open_links_in_external_browser: types.optional(types.boolean, false),
  open_links_with_reader_mode: types.optional(types.boolean, false),
  auto_android_theme: types.optional(types.boolean, true)
})
.actions(self => ({

  hydrate: flow(function* () {
    console.log("Settings:hydrate")
    const data = yield AsyncStorage.getItem('Settings')
    if (data) {
      applySnapshot(self, JSON.parse(data))
      console.log("Settings:hydrate:with_data")
    }
  }),
  
  toggle_open_links_in_external_browser: flow(function* () {
    console.log("Settings:toggle_open_links_in_external_browser")
    self.open_links_in_external_browser = !self.open_links_in_external_browser
  }),
  
  toggle_open_links_with_reader_mode: flow(function* () {
    console.log("Settings:open_links_with_reader_mode")
    self.open_links_with_reader_mode = !self.open_links_with_reader_mode
  }),

  set_auto_android_theme: flow(function* (enabled = true) {
    console.log("Settings:set_auto_android_theme", enabled)
    self.auto_android_theme = enabled
  })
  
}))
.create();
