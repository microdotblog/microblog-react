import { AppRegistry } from 'react-native';
import { enableScreens } from 'react-native-screens';
import MainApp from './screens/App';
import { name as appName } from './../app.json';
import './utils/dev';
import './utils/string_checker';
import './utils/snapshots';
import './utils/string_utils';

enableScreens(true)

AppRegistry.registerComponent(appName, () => MainApp);