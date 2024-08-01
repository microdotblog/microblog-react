import * as React from 'react';
import { View } from 'react-native'
import { observer } from 'mobx-react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PostingScreen from '../../screens/posts/new';
import PostingOptionsScreen from '../../screens/posts/options';
import CloseModalButton from '../../components/header/close';
import PostButton from '../../components/header/post_button';
import RemoveImageButton from '../../components/header/remove_image';
import ImageOptionsScreen from '../../screens/posts/image_options';
import UploadsScreen from '../uploads/uploads'
import NewUploadButton from '../../components/header/new_upload';
import RefreshActivity from '../../components/header/refresh_activity';

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
          headerTintColor: App.theme_text_color(),
          headerBackTitleVisible: false
				}}
			>
        <PostingStack.Screen
          name="NewPost"
          component={PostingScreen}
          options={{
            headerTitle: "New Post",
            headerRight: () => <PostButton />,
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
        <PostingStack.Screen
          name="ImageOptions"
          component={ImageOptionsScreen}
          options={({ route, navigation }) => ({
            headerTitle: "Image Options",
            headerRight: () => <RemoveImageButton navigation={navigation} asset={route.params?.asset} index={route.params?.index} />
          })}
        />
        <PostingStack.Screen
          name="PostUploads"
          component={UploadsScreen}
          options={{
            headerTitle: "Uploads",
            headerRight: () => {
              return (
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <RefreshActivity type="uploads" />
                  <NewUploadButton />
                </View>
              )
            }
          }}
        />
      </PostingStack.Navigator>
    )
  }

}
