import './utils/dev';
import './utils/string_checker';
import './utils/string_utils';
import './utils/snapshots';
import { AppRegistry } from "react-native"
import ShareScreen from "./screens/share"

AppRegistry.registerComponent(
	"ShareMenuModuleComponent", () => ShareScreen
)