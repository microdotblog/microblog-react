import * as React from 'react';
import { observer } from 'mobx-react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MentionsScreen from '../mentions/mentions';
import ProfileImage from './../../components/header/profile_image';
import NewPostButton from '../../components/header/new_post';
import BackButton from '../../components/header/back';
import { getSharedScreens } from './SharedStack'
import App from '../../stores/App'

const MentionsStack = createNativeStackNavigator();

@observer
export default class Mentions extends React.Component{

  render() {
    const sharedScreens = getSharedScreens(MentionsStack, "Mentions")
    return(
      <MentionsStack.Navigator
        screenOptions={{
          headerTintColor: App.theme_text_color(),
          headerBackVisible: false,
          headerStatusBarHeight: Platform.OS === 'android' ? 0 : undefined
        }}
      >
        <MentionsStack.Screen
          name="Mentions"
          component={MentionsScreen}
          options={{
            headerLeft: () => <ProfileImage />,
            headerRight: () => <NewPostButton />
          }}
        />
        <MentionsStack.Group
          screenOptions={({ }) => ({
            headerLeft: () => <BackButton />,
            headerBackTitleVisible: false
          })}
        >
          {sharedScreens}
        </MentionsStack.Group>
      </MentionsStack.Navigator>
    )
  }

}
