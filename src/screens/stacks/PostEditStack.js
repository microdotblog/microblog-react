import * as React from 'react';
import { observer } from 'mobx-react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PostEditScreen from '../posts/edit';
import PostingOptionsScreen from '../../screens/posts/options';
import ClosePostClearButton from '../../components/header/close_post_clear';
import UpdatePostButton from '../../components/header/update_post';
import App from '../../stores/App'

const PostingEditStack = createNativeStackNavigator();

@observer
export default class PostEditStack extends React.Component{

  render() {
    return(
			<PostingEditStack.Navigator
				initialRouteName='PostEditScreen'
				screenOptions={{
					gestureEnabled: false,
          headerShown: true,
          headerBackTitle: "Back",
          headerTintColor: App.theme_text_color(),
          headerBackTitleVisible: false,
          headerStatusBarHeight: Platform.OS === 'android' ? 0 : undefined
				}}
			>
        <PostingEditStack.Screen
          name="PostEditScreen"
          component={PostEditScreen}
          options={{
            headerTitle: "Edit Post",
            headerRight: () => <UpdatePostButton />,
            headerLeft: () => <ClosePostClearButton />
          }}
        />
        <PostingEditStack.Screen
          name="PostEditOptions"
          component={PostingOptionsScreen}
          options={{
            headerTitle: "Posting Options"
          }}
        />
      </PostingEditStack.Navigator>
    )
  }

}
