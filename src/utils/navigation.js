import * as React from 'react';
import { Navigation } from "react-native-navigation"
import App from '../stores/App'
import Reply from '../stores/Reply'
import { replyScreen, Screens } from './../screens';

Screens.forEach((ScreenComponent, key) => 
Navigation.registerComponent(key, () => (props) => (
  <ScreenComponent {...props} />
)
));

Navigation.events().registerComponentDidAppearListener(({ componentName, componentId }) => {
  switch (componentName) {
    case componentName.includes("microblog.component"):
      return
    case "__initBottomSheet__":
      return
    default:
      App.set_current_screen_name_and_id(componentName, componentId)
      break;
  }
});