import * as React from 'react';

import { observer } from 'mobx-react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TimelineScreen from '../timeline/timeline';
import ProfileImage from './../../components/header/profile_image';
import NewPostButton from '../../components/header/new_post';
import BackButton from '../../components/header/back';
import { getSharedScreens } from './SharedStack'
import App from '../../stores/App'
import { android_status_bar_options, headerLeftElement, headerRightElement } from '../../utils/navigation'

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
          ...android_status_bar_options()
        }}
      >
        <TimelineStack.Screen
          name="Timeline"
          component={TimelineScreen}
          options={({ route }) => ({
            ...headerLeftElement(() => <ProfileImage routeKey={route.name} />),
            ...headerRightElement(() => <NewPostButton />),
          })}
        />
        <TimelineStack.Group
          screenOptions={({ }) => ({
            ...headerLeftElement(() => <BackButton />),
            headerBackTitleVisible: false,
          })}
        >
          {sharedScreens}
        </TimelineStack.Group>
      </TimelineStack.Navigator>
    )
  }

}
