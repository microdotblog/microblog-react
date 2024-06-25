import * as React from 'react';
import { observer } from 'mobx-react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import App from '../../stores/App';
import TimelineStack from './TimelineStack';
import MentionsStack from './MentionsStack';
import BookmarksStack from './BookmarksStack';
import DiscoverStack from './DiscoverStack';

const Tab = createBottomTabNavigator();

@observer
export default class TabNavigator extends React.Component{
  
  async componentDidMount(){
    App.set_navigation(this.props.navigation)
  }

  render() {
    return(
      <Tab.Navigator
        screenOptions={{ 
          headerShown: false,
          tabBarActiveTintColor: App.theme_accent_color()
        }}
      >
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
    )
  }

}