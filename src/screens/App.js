import * as React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { observer } from 'mobx-react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SheetProvider } from "react-native-actions-sheet";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import App from './../stores/App';
import TabNavigator from './stacks/TabNavigator';
import LoginScreen from './login/login';
import ReplyScreen from './conversation/reply';
import CloseModalButton from '../components/header/close';
import PostReplyButton from '../components/header/post_reply';
import HelpScreen from './help/help';
import SettingsScreen from './settings/settings';
import PostOptionsSettingsScreen from './settings/post_options';
import AddBookmarkScreen from './bookmarks/add_bookmark';
import ReplyEditScreen from './replies/edit';
import UpdateReplyButton from '../components/header/update_reply';

import "./../components/sheets/sheets";

const Stack = createNativeStackNavigator();

@observer
export default class MainApp extends React.Component {

  async componentDidMount() {
    App.hydrate()
  }
  
  render() {
    if(App.is_loading){
      return(
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: App.theme_background_color() }}>
          <ActivityIndicator color={App.theme_accent_color()} size="large" />
        </View>
      )
    }
    return(
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SheetProvider>
          <NavigationContainer
            theme={{
            dark: App.is_dark_mode(),
            colors: {
              background: App.theme_background_color(),
              text: App.theme_text_color(),
              card: App.theme_navbar_background_color()
            }
          }}>
            <Stack.Navigator initialRouteName="Tabs" screenOptions={{ headerShown: false, headerTintColor: App.theme_text_color() }}>
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
                  gestureEnabled: true,
                  headerLeft: () => <CloseModalButton />
                }}
              >
                <Stack.Screen
                  name="Reply"
                  component={ReplyScreen}
                  options={({ route }) => ({
                    headerTitle: "New Reply",
                    gestureEnabled: true,
                    headerRight: () => <PostReplyButton conversation_id={route.params?.conversation_id} />
                  })}
                />
                <Stack.Screen
                  name="Help"
                  component={HelpScreen}
                  options={{
                    title: "Help",
                    gestureEnabled: true,
                  }}
                />
                <Stack.Screen
                  name="Settings"
                  component={SettingsScreen}
                  options={{
                    title: "Settings"
                  }}
                />
                <Stack.Screen
                  name="PostService"
                  component={PostOptionsSettingsScreen}
                  options={{
                    title: "Posting Options"
                  }}
                />
                <Stack.Screen
                  name="AddBookmark"
                  component={AddBookmarkScreen}
                  options={{
                    headerTitle: "Add bookmark"
                  }}
                />
                <Stack.Screen
                  name="ReplyEdit"
                  component={ReplyEditScreen}
                  options={{
                    headerTitle: "Update Reply",
                    gestureEnabled: false,
                    headerRight: () => <UpdateReplyButton />
                  }}
                />
              </Stack.Group>
            </Stack.Navigator>
          </NavigationContainer>
        </SheetProvider>
      </GestureHandlerRootView>
    )
  }
  
}