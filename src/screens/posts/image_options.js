import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, TextInput, KeyboardAvoidingView, Alert } from 'react-native';
import Auth from '../../stores/Auth';
import App from '../../stores/App'
import { Dimensions } from 'react-native';
import { Navigation } from 'react-native-navigation';
import Video from 'react-native-video';

@observer
export default class ImageOptionsScreen extends React.Component{

  constructor(props) {
    super(props);
    Navigation.events().registerNavigationButtonPressedListener(({ buttonId }) => {
      if (buttonId === 'remove_image') {
        const { asset, index } = this.props
          this._handle_image_remove(asset, index)
      }
    });
  }
  

  _handle_image_remove = (image, index) => {
    const { posting } = Auth.selected_user
    const existing_index = posting.post_assets?.findIndex(file => file.uri === image.uri)
    if (existing_index > -1) {
      Alert.alert(
        "Remove upload?",
        "Are you sure you want to remove this upload from this post?",
        [
          {
            text: "Cancel",
            style: 'cancel',
          },
          {
            text: "Remove",
            onPress: () => { Navigation.popToRoot(this.props.componentId) ; posting.remove_asset(index) },
            style: 'destructive'
          },
        ],
        {cancelable: false},
      );
    }
  }

  render() {
    const { posting } = Auth.selected_user
    const { asset } = this.props
    
    const max_media_height = 300; // cap media height
    const window_width = Dimensions.get('window').width;
    let media_width = window_width;
    let media_height = window_width; // default to 1:1

    if (asset.width && asset.height) {
      const aspect_ratio = asset.width / asset.height;
      media_height = window_width / aspect_ratio;
      
      if (media_height > max_media_height) {
        media_height = max_media_height;
        media_width = max_media_height * aspect_ratio;
      }
    }

    return(
      <KeyboardAvoidingView behavior={"padding"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', width: "100%", }}>
          <View
            style={{
              position: 'relative',
              justifyContent: 'center',
              alignItems: 'center',
              width: media_width,
              height: media_height,
              backgroundColor: '#E5E7EB'
            }}
          >
            {
              asset.is_video ?
              <Video
                source={{ uri: asset.uri }}
                poster={asset.remote_poster_url ? asset.remote_poster_url : asset.uri} style={{width: media_width, height: media_height}}
                mixWithOthers={"mix"}
                controls
                repeat
              />
              // <Image source={{ uri: asset.remote_poster_url ? asset.remote_poster_url : asset.uri }} style={{ width: 250, height: 250, borderRadius: 5 }} />
              :
              <Image source={{ uri: asset.remote_url ? asset.remote_url : asset.uri }} style={{ width: media_width, height: media_height }} />
            }
            {
              asset.is_uploading ?
                <>
                  <ActivityIndicator color="#f80" size={"large"} style={{ position: 'absolute' }} />
                  <View
                    style={{
                      width: `${ asset.progress }%`,
                      height: 5,
                      backgroundColor: App.theme_accent_color(),
                      position: 'absolute',
                      left: 0,
                      bottom: 0,
                      borderBottomLeftRadius: 5,
                      borderBottomRightRadius: asset.progress === 100 ? 5 : 0,
                      zIndex: 2
                    }}
                  />
                </>
              : null
            }
          </View>
          {
            !asset.is_video &&
            <TextInput
              placeholder="Accessibility description"
              placeholderTextColor={App.theme_placeholder_alt_text_color()}
              style={{
                fontSize: 20,
                padding: 9,
                paddingTop: 13,
                paddingBottom: 143,
                fontWeight: '400',
                color: App.theme_text_color(),
                width: "100%",
              }}
              editable={!posting.is_sending_post}
              multiline={true}
              scrollEnabled={false}
              returnKeyType={'default'}
              keyboardType={'default'}
              autoFocus={false}
              autoCorrect={true}
              clearButtonMode={'while-editing'}
              enablesReturnKeyAutomatically={true}
              underlineColorAndroid={'transparent'}
              value={asset.alt_text}
              onChangeText={(text) => !posting.is_sending_post ? asset.set_alt_text(text) : null}
            />
          }
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }

}
