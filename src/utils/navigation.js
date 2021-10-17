import * as React from 'react';
import { Navigation } from "react-native-navigation"
import { Screens } from './../screens';

Screens.forEach((ScreenComponent, key) => 
Navigation.registerComponent(key, () => (props) => (
  <ScreenComponent {...props} />
)
));