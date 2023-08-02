import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  "Error: Nothing to dismiss",
  "Can't perform a React state update on an unmounted component",
  "Error: A stack can't contain two children with the same id",
  "Cannot record touch end without",
  "Require cycle:",
  "onAnimatedValueUpdate",
  "Cannot update during an existing state transition"
])
