import * as React from 'react';
import { observer } from 'mobx-react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PostingScreen from '../../screens/posts/new';

const PostingStack = createNativeStackNavigator();

@observer
export default class Posting extends React.Component{

  render() {
    return(
			<PostingStack.Navigator
				initialRouteName='NewPost'
				screenOptions={{
					gestureEnabled: false,
					headerShown: false
				}}
			>
        <PostingStack.Screen
          name="NewPost"
          component={PostingScreen}
          options={{
            headerTitle: "New Post"
          }}
        />
      </PostingStack.Navigator>
    )
  }

}
