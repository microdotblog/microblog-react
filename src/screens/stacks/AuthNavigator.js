import * as React from 'react'
import { Platform, StatusBar } from 'react-native'
import { observer } from 'mobx-react'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SheetProvider } from 'react-native-actions-sheet'
import App from '../../stores/App'
import LoginScreen from '../login/login'
import AppleUsernameScreen from '../login/apple_username'
import BackButton from '../../components/header/back'
import { android_status_bar_options, headerLeftElement } from '../../utils/navigation'

const Stack = createNativeStackNavigator()
const renderBackButton = () => <BackButton />

@observer
export default class AuthNavigator extends React.Component {
  render() {
    return (
      <>
        {
          Platform.OS === 'android' &&
          <StatusBar
            barStyle={App.is_dark_mode() ? 'light-content' : 'dark-content'}
            backgroundColor="transparent"
            translucent
          />
        }
        <NavigationContainer
          onReady={() => {
            App.set_navigation_ready(true)
          }}
          theme={{
            dark: App.is_dark_mode(),
            colors: {
              background: App.theme_background_color(),
              text: App.theme_text_color(),
              card: App.theme_navbar_background_color()
            },
            fonts: DefaultTheme.fonts
          }}
          ref={navigationRef => {
            App.set_navigation(navigationRef)
          }}
        >
          <SheetProvider>
            <Stack.Navigator
              initialRouteName="Login"
              screenOptions={{
                headerShown: false,
                headerTintColor: App.theme_text_color(),
                contentStyle: { backgroundColor: 'transparent' },
                ...android_status_bar_options()
              }}
            >
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{
                  title: 'Sign In',
                  headerShown: false
                }}
              />
              <Stack.Screen
                name="AppleUsername"
                component={AppleUsernameScreen}
                options={{
                  title: 'Create Account',
                  headerShown: true,
                  headerBackTitle: 'Sign In',
                  headerTransparent: true,
                  headerShadowVisible: false,
                  headerStyle: {
                    backgroundColor: 'transparent'
                  },
                  ...headerLeftElement(renderBackButton)
                }}
              />
            </Stack.Navigator>
          </SheetProvider>
        </NavigationContainer>
      </>
    )
  }
}
