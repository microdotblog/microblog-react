import { AppRegistry } from 'react-native';
import * as WebBrowser from 'expo-web-browser'
import './bootstrap/push_notifications'
import MainApp from './screens/App';
import { name as appName } from './../app.json';
import './utils/dev';
import './utils/string_checker';
import './utils/snapshots';
import './utils/string_utils';

WebBrowser.maybeCompleteAuthSession()

AppRegistry.registerComponent(appName, () => MainApp);
