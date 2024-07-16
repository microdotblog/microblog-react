import * as React from 'react';
import { observer } from 'mobx-react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MentionsScreen from '../mentions/mentions';
import ProfileImage from './../../components/header/profile_image';
import NewPostButton from '../../components/header/new_post';
import ProfileScreen from '../../screens/profile/profile';

const MentionsStack = createNativeStackNavigator();

@observer
export default class Mentions extends React.Component{

  render() {
    return(
      <MentionsStack.Navigator>
        <MentionsStack.Screen
          name="Mentions"
          component={MentionsScreen}
          options={{
            headerLeft: () => <ProfileImage />,
            headerRight: () => <NewPostButton />
          }}
        />
        <MentionsStack.Group
          screenOptions={{
            headerBackTitleVisible: false
          }}
        >
          <MentionsStack.Screen
            name="Profile"
            component={ProfileScreen}
            options={({ route }) => ({
              headerTitle: `@${route.params?.username}`,
              headerRight: () => <NewPostButton />
            })}
          />
        </MentionsStack.Group>
      </MentionsStack.Navigator>
    )
  }

}
