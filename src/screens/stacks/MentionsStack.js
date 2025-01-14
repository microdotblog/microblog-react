import * as React from 'react';
import { observer } from 'mobx-react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MentionsScreen from '../mentions/mentions';
import ProfileImage from './../../components/header/profile_image';
import NewPostButton from '../../components/header/new_post';
import BackButton from '../../components/header/back';
import { getSharedScreens } from './SharedStack'

const MentionsStack = createNativeStackNavigator();

@observer
export default class Mentions extends React.Component{

  render() {
    const sharedScreens = getSharedScreens(MentionsStack, "Mentions")
    return(
      <MentionsStack.Navigator>
        <MentionsStack.Screen
          name="Mentions"
          component={MentionsScreen}
          options={{
            headerLeft: () => <ProfileImage />,
            headerRight: () => <NewPostButton />,
            headerTintColor: App.theme_text_color()
          }}
        />
        <MentionsStack.Group
          screenOptions={{
            headerLeft: () => <BackButton navigation={this.props.navigation} />,
            headerBackTitleVisible: false,
            headerTintColor: App.theme_text_color()
          }}
        >
          {sharedScreens}
        </MentionsStack.Group>
      </MentionsStack.Navigator>
    )
  }

}
