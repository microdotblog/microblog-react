import * as React from 'react';
import { View, Platform } from 'react-native'
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
import BackButton from '../../components/header/back';
import Auth from '../../stores/Auth'
import App from '../../stores/App'
import { headerItemGroupStyle, headerLeftElement, headerRightElement } from '../../utils/navigation'
import { isLiquidGlass } from '../../utils/ui'

const PostingStack = createNativeStackNavigator();

function uploadMenuHeaderItem() {
  if (Auth.selected_user == null || !Auth.selected_user.posting?.posting_enabled()) {
    return null
  }

  const { config } = Auth.selected_user.posting.selected_service

  return {
    type: 'menu',
    label: 'Upload',
    icon: {
      type: 'sfSymbol',
      name: 'icloud.and.arrow.up'
    },
    identifier: 'new-upload',
    tintColor: App.theme_text_color(),
    width: 28,
    menu: {
      items: [
        {
          type: 'action',
          label: 'Photo library',
          icon: {
            type: 'sfSymbol',
            name: 'photo'
          },
          onPress: () => {
            Auth.selected_user.posting.selected_service?.pick_image(config?.temporary_destination())
          }
        },
        {
          type: 'action',
          label: 'Files',
          icon: {
            type: 'sfSymbol',
            name: 'folder'
          },
          onPress: () => {
            Auth.selected_user.posting.selected_service?.pick_file(config?.temporary_destination())
          }
        }
      ]
    }
  }
}

function uploadsHeaderItems() {
  const items = []
  if (Auth.selected_user?.posting?.selected_service?.is_loading_uploads) {
    items.push({
      type: 'custom',
      element: <RefreshActivity type="uploads" />,
      hidesSharedBackground: true
    })
  }

  const upload_item = uploadMenuHeaderItem()
  if (upload_item != null) {
    items.push(upload_item)
  }

  return items
}

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
          headerBackTitleVisible: false,
          headerStatusBarHeight: Platform.OS === 'android' ? 0 : undefined
				}}
			>
        <PostingStack.Screen
          name="NewPost"
          component={PostingScreen}
          options={{
            headerTitle: "New Post",
            ...headerLeftElement(() => <CloseModalButton />),
            ...headerRightElement(() => <PostButton />)
          }}
        />
        <PostingStack.Screen
          name="PostingOptions"
          component={PostingOptionsScreen}
          options={{
            headerTitle: "Posting Options",
            ...headerLeftElement(() => <BackButton />)
          }}
        />
        <PostingStack.Screen
          name="ImageOptions"
          component={ImageOptionsScreen}
          options={({ route, navigation }) => ({
            headerTitle: "Image Options",
            ...headerLeftElement(() => <BackButton />),
            ...headerRightElement(() => <RemoveImageButton navigation={navigation} asset_uri={route.params?.asset_uri} index={route.params?.index} />)
          })}
        />
        <PostingStack.Screen
          name="PostUploads"
          component={UploadsScreen}
          options={{
            headerTitle: "Uploads",
            ...headerLeftElement(() => <BackButton />),
            ...(isLiquidGlass() ?
              {
                unstable_headerRightItems: uploadsHeaderItems
              }
              :
              headerRightElement(() => {
                return (
                  <View style={headerItemGroupStyle(10)}>
                    <RefreshActivity type="uploads" />
                    <NewUploadButton />
                  </View>
                )
              })
            )
          }}
        />
      </PostingStack.Navigator>
    )
  }

}
