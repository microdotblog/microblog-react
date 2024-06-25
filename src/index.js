import { AppRegistry } from 'react-native';
import MainApp from './screens/App';
import { name as appName } from './../app.json';
import './utils/dev';
import './utils/navigation';
import './utils/string_checker';
import './utils/snapshots';
import './utils/string_utils';

AppRegistry.registerComponent(appName, () => MainApp);