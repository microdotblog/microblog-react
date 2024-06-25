import * as React from 'react';
import { observer } from 'mobx-react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SheetProvider } from "react-native-actions-sheet";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import App from './../stores/App';
import LoadingScreen from './loading/Loading';

const Stack = createNativeStackNavigator();

@observer
export default class MainApp extends React.Component {

  async componentDidMount() {
    App.hydrate()
  }
  
  render() {
    return(
      <GestureHandlerRootView style={{ flex: 1 }}>
      <SheetProvider>
        <NavigationContainer theme={{
          dark: App.is_dark_mode(),
          colors: {
            background: App.theme_background_color(),
            text: App.theme_text_color(),
            card: App.theme_navbar_background_color()
          }
        }}>
        <Stack.Navigator initialRouteName="Loading">
          <Stack.Screen
            name="Loading"
            component={LoadingScreen}
            options={{
              headerShown: false
            }}
          />
        </Stack.Navigator>
        </NavigationContainer>
      </SheetProvider>
      </GestureHandlerRootView>
    )
  }
  
}