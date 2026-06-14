import * as React from 'react';
import { observer } from 'mobx-react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DiscoverScreen from '../discover/discover';
import ProfileImage from './../../components/header/profile_image';
import NewPostButton from '../../components/header/new_post';
import BackButton from '../../components/header/back';
import DiscoverTopicScreen from '../../screens/discover/topic';
import { getSharedScreens } from './SharedStack'
import App from '../../stores/App'
import Auth from '../../stores/Auth'
import { headerLeftElement, headerRightElement } from '../../utils/navigation'
import { isLiquidGlass } from '../../utils/ui'

const DiscoverStack = createNativeStackNavigator();

function newPostHeaderItem() {
  if (Auth.selected_user == null || !Auth.selected_user.posting?.posting_enabled()) {
    return null
  }

  return {
    type: 'button',
    label: 'New Post',
    icon: {
      type: 'sfSymbol',
      name: 'square.and.pencil'
    },
    identifier: 'new-post',
    tintColor: App.theme_text_color(),
    width: 28,
    onPress: () => App.navigate_to_screen("Posting")
  }
}

function newPostHeaderItems() {
  return [newPostHeaderItem()].filter(Boolean)
}

@observer
export default class Discover extends React.Component{

  render() {
    const sharedScreens = getSharedScreens(DiscoverStack, "Discover")
    return(
      <DiscoverStack.Navigator
        screenOptions={{
          headerTintColor: App.theme_text_color(),
          headerBackVisible: false,
          headerStatusBarHeight: Platform.OS === 'android' ? 0 : undefined
        }}
      >
        <DiscoverStack.Screen
          name="Discover"
          component={DiscoverScreen}
          options={({ route }) => ({
            ...headerLeftElement(() => <ProfileImage routeKey={route.name} />),
            ...headerRightElement(() => <NewPostButton />)
          })}
        />
        <DiscoverStack.Group
          screenOptions={({ }) => ({
            ...headerLeftElement(() => <BackButton />),
            headerBackTitleVisible: false
          })}
        >
          {sharedScreens}
          <DiscoverStack.Screen
            name="DiscoverTopic"
            component={DiscoverTopicScreen}
            options={({ route }) => ({
              headerTitle: `${route.params?.topic.emoji} ${route.params?.topic.title}`,
              ...(isLiquidGlass() ?
                {
                  unstable_headerRightItems: newPostHeaderItems
                }
                :
                headerRightElement(() => <NewPostButton />)
              )
            })}
          />
        </DiscoverStack.Group>
      </DiscoverStack.Navigator>
    )
  }

}
