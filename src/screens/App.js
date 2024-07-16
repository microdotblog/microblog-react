import * as React from 'react';
import { observer } from 'mobx-react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SheetProvider } from "react-native-actions-sheet";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import App from './../stores/App';
import TabNavigator from './stacks/TabNavigator';
import LoginScreen from './login/login';
import ReplyScreen from './conversation/reply';
import ProfileScreen from './profile/profile';
import CloseModalButton from '../components/header/close';
import NewPostButton from '../components/header/new_post';
import "./../components/sheets/sheets";

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
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Tabs" component={TabNavigator}/>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              title: "Sign in",
              headerShown: true,
              headerBackTitle: "Back"
            }}
          />
          <Stack.Group
            screenOptions={{
              presentation: "modal",
              headerShown: true,
              headerLeft: () => <CloseModalButton />
            }}
          >
            <Stack.Screen
              name="Reply"
              component={ReplyScreen}
              options={{
                headerTitle: "New Reply",
                gestureEnabled: false
              }}
            />
          </Stack.Group>
          <Stack.Group
            screenOptions={{
              headerShown: true,
              headerBackTitleVisible: false
            }}
          >
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={({ navigation, route }) => ({
                headerTitle: `@${route.params.username}`,
                headerRight: () => <NewPostButton />
              })}
            />
          </Stack.Group>
        </Stack.Navigator>
        </NavigationContainer>
      </SheetProvider>
      </GestureHandlerRootView>
    )
  }
  
}