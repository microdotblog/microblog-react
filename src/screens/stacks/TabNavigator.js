import * as React from 'react';
import { observer } from 'mobx-react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import App from '../../stores/App';
import TimelineStack from './TimelineStack';
import MentionsStack from './MentionsStack';
import BookmarksStack from './BookmarksStack';
import DiscoverStack from './DiscoverStack';
import TabIcon from '../../components/tabs/tab';

const Tab = createBottomTabNavigator();

@observer
export default class TabNavigator extends React.Component{

  render() {
    return(
      <Tab.Navigator
        id="tab_navigator"
        initialRouteName="TimelineStack"
        screenOptions={({ route }) => ({
          tabBarStyle: {
            borderTopColor: App.theme_tabbar_divider_color(),
            borderTopWidth: 0.5
          },
          tabBarIcon: ({ focused, color, size }) => {
            return <TabIcon route={route} focused={focused} size={size} color={color} />;
          },
          headerShown: false,
          tabBarActiveTintColor: App.theme_accent_color()
        })}
        screenListeners={{
          state: (e) => {
            App.set_current_tab_index(e.data.state.index)
          },
          focus: (e) => {
            App.set_current_tab_key(e.target)
          },
          tabPress: (e) => {
            App.scroll_web_view_to_top(e.target)
          }
        }}
      >
        <Tab.Screen
          name="TimelineStack"
          component={TimelineStack}
          options={{
            tabBarLabel: "Timeline",
            headerTitle: "Timeline"
          }}
        />
        <Tab.Screen
          name="MentionsStack"
          component={MentionsStack}
          options={{
            tabBarLabel: "Mentions",
            headerTitle: "Mentions"
          }}
        />
        <Tab.Screen
          name="BookmarksStack"
          component={BookmarksStack}
          options={{
            tabBarLabel: "Bookmarks",
            headerTitle: "Bookmarks"
          }}
        />
        <Tab.Screen
          name="DiscoverStack"
          component={DiscoverStack}
          options={{
            tabBarLabel: "Discover",
            headerTitle: "Discover"
          }}
        />
      </Tab.Navigator>
    )
  }

}
