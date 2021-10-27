import * as React from 'react';
import { Navigation } from "react-native-navigation"
import App from '../stores/App'
import { PROFILE_IMAGE, Screens } from './../screens';

Screens.forEach((ScreenComponent, key) => 
Navigation.registerComponent(key, () => (props) => (
  <ScreenComponent {...props} />
)
));

Navigation.events().registerComponentDidAppearListener(({ componentName }) => {
  switch (componentName) {
    case PROFILE_IMAGE:
      return
    default:
      App.set_current_screen_name(componentName)
      break;
  }
});