import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  "Error: Nothing to dismiss",
  "Can't perform a React state update on an unmounted component",
  "Error: A stack can't contain two children with the same id",
  "Cannot record touch end without",
  "Require cycle:",
  "onAnimatedValueUpdate",
  "Cannot update during an existing state transition",
  "You are trying to read or write to an object that is no longer part of a state tree",
  "Cannot read property 'addNodeToCache' of undefined",
  "the creation of the observable instance must be done on the initializing phase"
])
