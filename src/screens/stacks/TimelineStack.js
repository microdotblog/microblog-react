import * as React from 'react';

import { observer } from 'mobx-react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TimelineScreen from '../timeline/timeline';
import ProfileImage from './../../components/header/profile_image';
import NewPostButton from '../../components/header/new_post';
import BackButton from '../../components/header/back';
import { getSharedScreens } from './SharedStack'

const TimelineStack = createNativeStackNavigator();

@observer
export default class Timeline extends React.Component{

  render() {
    const sharedScreens = getSharedScreens(TimelineStack, "Timeline")
    return(
      <TimelineStack.Navigator
        screenOptions={{
          headerTintColor: App.theme_text_color(),
          headerBackVisible: false
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
