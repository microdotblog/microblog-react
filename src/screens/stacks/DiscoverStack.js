import * as React from 'react';
import { observer } from 'mobx-react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DiscoverScreen from '../discover/discover';
import ProfileImage from './../../components/header/profile_image';
import NewPostButton from '../../components/header/new_post';
import ProfileScreen from '../../screens/profile/profile';

const DiscoverStack = createNativeStackNavigator();

@observer
export default class Discover extends React.Component{

  render() {
    return(
      <DiscoverStack.Navigator>
        <DiscoverStack.Screen
          name="Discover"
          component={DiscoverScreen}
          options={{
            headerLeft: () => <ProfileImage />,
            headerRight: () => <NewPostButton />
          }}
        />
        <DiscoverStack.Group
          screenOptions={{
            headerBackTitleVisible: false
          }}
        >
          <DiscoverStack.Screen
            name="Profile"
            component={ProfileScreen}
            options={({ route }) => ({
              headerTitle: `@${route.params?.username}`,
              headerRight: () => <NewPostButton />
            })}
          />
        </DiscoverStack.Group>
      </DiscoverStack.Navigator>
    )
  }

}
