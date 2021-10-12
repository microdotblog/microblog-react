import './utils/navigation';
import { Navigation } from "react-native-navigation";
import App from './stores/App';

Navigation.events().registerAppLaunchedListener(() => {
  console.log("APP:LAUNCHED")
  App.hydrate()
});