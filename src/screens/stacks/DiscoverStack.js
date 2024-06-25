import * as React from 'react';
import { observer } from 'mobx-react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DiscoverScreen from '../discover/discover';

const Stack = createNativeStackNavigator();

@observer
export default class DiscoverStack extends React.Component{

  render() {
    return(
      <Stack.Navigator>
        <Stack.Screen name="Discover" component={DiscoverScreen} />
      </Stack.Navigator>
    )
  }

}
