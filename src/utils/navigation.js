import * as React from 'react';
import { Navigation } from "react-native-navigation"
import App from '../stores/App'
import { Screens } from './../screens';

Screens.forEach((ScreenComponent, key) => 
Navigation.registerComponent(key, () => (props) => (
  <ScreenComponent {...props} />
)
));

Navigation.events().registerComponentDidAppearListener(({ componentName, componentId }) => {
  console.log("registerComponentDidAppearListener", componentName, componentId)
  switch (componentName) {
    case componentName.includes("microblog.component"):
      return
    case "__initBottomSheet__":
      return
    default:
      App.set_current_screen_name_and_id(componentName, componentId)
      break;
  }
})

Navigation.events().registerModalDismissedListener(({ componentId }) => {
  console.log("registerModalDismissedListener", componentId)
  App.set_previous_screen_name_and_id()
})

export const theme_options = (settings) => {

  return {
    ...settings,
    bottomTabs: {
      backgroundColor: App.theme_navbar_background_color(),
    },
    layout: {
      backgroundColor: App.theme_background_color(),
    },
    animations: {
      setRoot: {
        waitForRender: true,
      },
      setStackRoot: {
        waitForRender: true,
      },
    },
    bottomTab: {
      selectedIconColor: "#f80",
      selectedTextColor: "#f80",
      iconColor: App.theme_navigation_icon_color(),
      textColor: App.theme_navigation_icon_color(),
    },
    topBar: {
      background: {
        color: App.theme_navbar_background_color()
      },
      leftButtonColor: App.theme_text_color(),
      rightButtonColor: App.theme_text_color(),
      backButton: {
        color: App.theme_text_color(),
      },
      title: {
        color: App.theme_text_color(),
      }
    }
  }
};