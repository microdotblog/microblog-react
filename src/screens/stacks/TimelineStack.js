import * as React from 'react';

import { observer } from 'mobx-react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TimelineScreen from '../timeline/timeline';
import ProfileImage from './../../components/header/profile_image';
import NewPostButton from '../../components/header/new_post';
import BackButton from '../../components/header/back';
import { getSharedScreens } from './SharedStack'
import App from '../../stores/App'

const TimelineStack = createNativeStackNavigator();

@observer
export default class Timeline extends React.Component{

  render() {
    const sharedScreens = getSharedScreens(TimelineStack, "Timeline")
    return(
      <TimelineStack.Navigator
        screenOptions={{
          headerTintColor: App.theme_text_color(),
          headerBackVisible: false,
          headerStatusBarHeight: Platform.OS === 'android' ? 0 : undefined
        }}
      >
        <TimelineStack.Screen
          name="Timeline"
          component={TimelineScreen}
          options={{
            headerLeft: () => <ProfileImage />,
            headerRight: () => <NewPostButton />,
          }}
        />
        <TimelineStack.Group
          screenOptions={({ }) => ({
            headerLeft: () => <BackButton />,
            headerBackTitleVisible: false,
          })}
        >
          {sharedScreens}
        </TimelineStack.Group>
      </TimelineStack.Navigator>
    )
  }

}
