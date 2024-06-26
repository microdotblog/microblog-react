import * as React from 'react';
import { observer } from 'mobx-react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MentionsScreen from '../mentions/mentions';
import ProfileImage from './../../components/header/profile_image';
import NewPostButton from '../../components/header/new_post';

const Stack = createNativeStackNavigator();

@observer
export default class MentionsStack extends React.Component{

  render() {
    return(
      <Stack.Navigator>
        <Stack.Screen
          name="Mentions"
          component={MentionsScreen}
          options={{
            headerLeft: () => <ProfileImage />,
            headerRight: () => <NewPostButton />
          }}
        />
      </Stack.Navigator>
    )
  }

}
