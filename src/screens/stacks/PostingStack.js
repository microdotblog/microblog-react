import * as React from 'react';
import { observer } from 'mobx-react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PostingScreen from '../../screens/posts/new';
import PostingOptionsScreen from '../../screens/posts/options';
import CloseModalButton from '../../components/header/close';

const PostingStack = createNativeStackNavigator();

@observer
export default class Posting extends React.Component{

  render() {
    return(
			<PostingStack.Navigator
				initialRouteName='NewPost'
				screenOptions={{
					gestureEnabled: false,
          headerShown: true,
          headerBackTitle: "Back",
          headerTintColor: App.theme_text_color()
				}}
			>
        <PostingStack.Screen
          name="NewPost"
          component={PostingScreen}
          options={{
            headerTitle: "New Post",
            headerLeft: () => <CloseModalButton />
          }}
        />
        <PostingStack.Screen
          name="PostingOptions"
          component={PostingOptionsScreen}
          options={{
            headerTitle: "Posting Options"
          }}
        />
      </PostingStack.Navigator>
    )
  }

}
