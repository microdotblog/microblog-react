import './utils/dev';
import './utils/navigation';
import './utils/string_checker';
import './utils/snapshots';
import './utils/string_utils';
import { Navigation } from "react-native-navigation";
import App from './stores/App';

Navigation.events().registerAppLaunchedListener(() => {
  console.log("APP:LAUNCHED")
  App.hydrate()
});