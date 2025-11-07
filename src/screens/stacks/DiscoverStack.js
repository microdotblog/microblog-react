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

const DiscoverStack = createNativeStackNavigator();

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
            headerLeft: () => <ProfileImage routeKey={route.name} />,
            headerRight: () => <NewPostButton />
          })}
        />
        <DiscoverStack.Group
          screenOptions={({ }) => ({
            headerLeft: () => <BackButton />,
            headerBackTitleVisible: false
          })}
        >
          {sharedScreens}
          <DiscoverStack.Screen
            name="DiscoverTopic"
            component={DiscoverTopicScreen}
            options={({ route }) => ({
              headerTitle: `${route.params?.topic.emoji} ${route.params?.topic.title}`,
              headerRight: () => <NewPostButton />
            })}
          />
        </DiscoverStack.Group>
      </DiscoverStack.Navigator>
    )
  }

}
