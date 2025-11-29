import * as React from 'react';
import { View, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { observer } from 'mobx-react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SheetProvider } from "react-native-actions-sheet";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from "react-native-keyboard-controller";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import App from './../stores/App';
import TabNavigator from './stacks/TabNavigator';
import LoginScreen from './login/login';
import ReplyScreen from './conversation/reply';
import CloseModalButton from '../components/header/close';
import Reply from '../stores/Reply';
import PostReplyButton from '../components/header/post_reply';
import HelpScreen from './help/help';
import SettingsScreen from './settings/settings';
import PostOptionsSettingsScreen from './settings/post_options';
import MutingScreen from './settings/muting';
import AddBookmarkScreen from './bookmarks/add_bookmark';
import AddCollectionScreen from './uploads/add_collection';
import ReplyEditScreen from './replies/edit';
import UpdateReplyButton from '../components/header/update_reply';
import PageEditScreen from './pages/edit';
import UpdatePageButton from '../components/header/update_page';
import Posting from './stacks/PostingStack';
import PostEditStack from './stacks/PostEditStack';

import "./../components/sheets/sheets";
import ClosePostClearButton from '../components/header/close_post_clear'
import Share from '../stores/Share'
import ShareMenu from 'react-native-share-menu'
import ShareScreen from './share'
import PublishingProgress from '../components/generic/publishing_progress'

const Stack = createNativeStackNavigator();

@observer
export default class MainApp extends React.Component {

  async componentDidMount() {
    App.hydrate().then( () => {
      if (Platform.OS == "android") {
        ShareMenu.addNewShareListener((share) => {
          console.log("App:set_up_url_listener:share", share)
          if (share?.data != null) {
            Share.hydrate_android_share(share)
            App.navigate_to_screen("Share")
          }        
        })
        ShareMenu.getInitialShare(async (share) => { 
          console.log("App:set_up_url_listener:getInitialShare", share)
          if (share?.data != null) {
            Share.hydrate_android_share(share)
            App.navigate_to_screen("Share")
          }
        })
      }
    })
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
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <SheetProvider>
              {
                Platform.OS === 'android' &&
                <StatusBar 
                  barStyle={App.is_dark_mode() ? 'light-content' : 'dark-content'} 
                  backgroundColor="transparent"
                  translucent={true}
                />
              }
              <NavigationContainer
                theme={{
                dark: App.is_dark_mode(),
                colors: {
                  background: App.theme_background_color(),
                  text: App.theme_text_color(),
                  card: App.theme_navbar_background_color()
                },
                fonts: DefaultTheme.fonts}}
                ref={navigationRef => {
                  App.set_navigation(navigationRef)
                }}
              >
                <Stack.Navigator
                  initialRouteName="Tabs"
                  screenOptions={{ 
                    headerShown: false, 
                    headerTintColor: App.theme_text_color(),
                    headerStatusBarHeight: Platform.OS === 'android' ? 0 : undefined
                  }}
                  
                >
                  <Stack.Screen name="Tabs" component={TabNavigator} />
                  <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{
                      title: "Sign In",
                      headerShown: true,
                      headerBackTitle: "Back",
                      headerStatusBarHeight: Platform.OS === 'android' ? 0 : undefined
                    }}
                  />
                  <Stack.Group
                    screenOptions={{
                      presentation: "modal",
                      headerShown: true,
                      gestureEnabled: true,
                      headerLeft: () => <CloseModalButton />,
                      headerStatusBarHeight: Platform.OS === 'android' ? 0 : undefined
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
                      name="muting"
                      component={MutingScreen}
                      options={{
                        title: "Muted Users and Keywords"
                      }}
                    />
                    <Stack.Screen
                      name="AddBookmark"
                      component={AddBookmarkScreen}
                      options={{
                        headerTitle: "Add Bookmark"
                      }}
                    />
                    <Stack.Screen
                      name="AddCollection"
                      component={AddCollectionScreen}
                      options={{
                        headerTitle: "Add Collection"
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
                    <Stack.Screen
                      name="PageEdit"
                      component={PageEditScreen}
                      options={{
                        headerTitle: "Edit Page",
                        gestureEnabled: false,
                        headerLeft: () => <ClosePostClearButton />,
                        headerRight: () => <UpdatePageButton />
                      }}
                    />
                    <Stack.Screen
                      name="PostEdit"
                      component={PostEditStack}
                      options={{
                        headerTitle: "Edit Post",
                        gestureEnabled: false,
                        headerShown: false
                      }}
                    />
                    <Stack.Screen
                      name="Posting"
                      component={Posting}
                      options={{
                        headerTitle: "New Post",
                        gestureEnabled: false,
                        headerShown: false
                      }}
                    />
                    {
                      Platform.OS === "android" &&
                      <Stack.Screen
                        name="Share"
                        component={ShareScreen}
                        options={{
                          headerTitle: "Share",
                          gestureEnabled: false,
                          headerShown: false
                        }}
                      />
                    }
                  </Stack.Group>
                </Stack.Navigator>
              </NavigationContainer>
              {
                Reply.is_sheet_open &&
                <View
                  pointerEvents={'none'}
                  style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.1)', zIndex: 10 }}
                />
              }
              <PublishingProgress />
            </SheetProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    )
  }
  
}
