import * as React from 'react';
import { observer } from 'mobx-react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SheetProvider } from "react-native-actions-sheet";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import App from './../stores/App';
import TimelineStack from './stacks/TimelineStack';
import MentionsStack from './stacks/MentionsStack';
import BookmarksStack from './stacks/BookmarksStack';
import DiscoverStack from './stacks/DiscoverStack';

const Tab = createBottomTabNavigator();

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
          <Tab.Navigator screenOptions={{ headerShown: false }}>
            <Tab.Screen
              name="TimelineStack"
              component={TimelineStack}
              options={{
                tabBarLabel: "Timeline"
              }}
            />
            <Tab.Screen
              name="MentionsStack"
              component={MentionsStack}
              options={{
                tabBarLabel: "Mentions"
              }}
            />
            <Tab.Screen
              name="BookmarksStack"
              component={BookmarksStack}
              options={{
                tabBarLabel: "Bookmarks"
              }}
            />
            <Tab.Screen
              name="DiscoverStack"
              component={DiscoverStack}
              options={{
                tabBarLabel: "Discover"
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </SheetProvider>
      </GestureHandlerRootView>
    )
  }
  
}