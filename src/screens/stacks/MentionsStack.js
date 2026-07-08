import * as React from 'react';
import { observer } from 'mobx-react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MentionsScreen from '../mentions/mentions';
import ProfileImage from './../../components/header/profile_image';
import NewPostButton from '../../components/header/new_post';
import BackButton from '../../components/header/back';
import { getSharedScreens } from './SharedStack'
import App from '../../stores/App'
import { android_status_bar_options, headerLeftElement, headerRightElement } from '../../utils/navigation'

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
          ...android_status_bar_options()
        }}
      >
        <MentionsStack.Screen
          name="Mentions"
          component={MentionsScreen}
          options={({ route }) => ({
            ...headerLeftElement(() => <ProfileImage routeKey={route.name} />),
            ...headerRightElement(() => <NewPostButton />)
          })}
        />
        <MentionsStack.Group
          screenOptions={({ }) => ({
            ...headerLeftElement(() => <BackButton />),
            headerBackTitleVisible: false
          })}
        >
          {sharedScreens}
        </MentionsStack.Group>
      </MentionsStack.Navigator>
    )
  }

}
