import * as React from 'react'
import { Platform } from 'react-native'
import { observer } from 'mobx-react'
import { createNativeBottomTabNavigator } from '@react-navigation/bottom-tabs/unstable'
import App from '../../stores/App'
import TimelineStack from './TimelineStack'
import MentionsStack from './MentionsStack'
import BookmarksStack from './BookmarksStack'
import DiscoverStack from './DiscoverStack'
import TimelineIcon from './../../assets/icons/tab_bar/timeline.png'
import MentionsIcon from './../../assets/icons/tab_bar/mentions.png'
import DiscoverIcon from './../../assets/icons/tab_bar/discover.png'
import BookmarksIcon from './../../assets/icons/nav/bookmarks.png'
import { isLiquidGlass, liquidGlassTintColor } from '../../utils/ui'

const Tab = createNativeBottomTabNavigator()

const TAB_ICONS = {
  TimelineStack: {
    ios: {
      default: 'bubble.left.and.bubble.right',
      selected: 'bubble.left.and.bubble.right.fill'
    },
    image: TimelineIcon
  },
  MentionsStack: {
    ios: {
      default: 'at',
      selected: 'at'
    },
    image: MentionsIcon
  },
  BookmarksStack: {
    ios: {
      default: 'star',
      selected: 'star.fill'
    },
    image: BookmarksIcon
  },
  DiscoverStack: {
    ios: {
      default: 'magnifyingglass',
      selected: 'magnifyingglass'
    },
    image: DiscoverIcon
  }
}

@observer
export default class TabNavigator extends React.Component {

  tab_icon(route_name, focused) {
    const icon = TAB_ICONS[route_name]

    if (Platform.OS === 'ios') {
      return {
        type: 'sfSymbol',
        name: focused ? icon.ios.selected : icon.ios.default
      }
    }

    return {
      type: 'image',
      source: icon.image
    }
  }

  tab_tint_color() {
    return App.theme_accent_color()
  }

  inactive_tab_tint_color() {
    return isLiquidGlass() ? liquidGlassTintColor() : App.theme_text_color()
  }

  tab_bar_style() {
    if (isLiquidGlass()) {
      return undefined
    }

    return {
      backgroundColor: App.theme_navbar_background_color(),
      shadowColor: App.theme_tabbar_divider_color()
    }
  }

  render() {
    return (
      <Tab.Navigator
        id="tab_navigator"
        initialRouteName="TimelineStack"
        screenOptions={({ route }) => ({
          tabBarStyle: this.tab_bar_style(),
          tabBarIcon: ({ focused }) => {
            return this.tab_icon(route.name, focused)
          },
          headerShown: false,
          tabBarActiveTintColor: this.tab_tint_color(),
          tabBarInactiveTintColor: this.inactive_tab_tint_color()
        })}
        screenListeners={{
          state: (e) => {
            App.set_current_tab_index(e.data?.state?.index)
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
