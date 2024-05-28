import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, TextInput, KeyboardAvoidingView, Alert } from 'react-native';
import Auth from '../../stores/Auth';
import App from '../../stores/App'
import { Dimensions } from 'react-native';
import { Navigation } from 'react-native-navigation';
import Clipboard from '@react-native-clipboard/clipboard';
import Video from 'react-native-video';
import MicroPubApi from '../../api/MicroPubApi';

@observer
export default class ImageOptionsScreen extends React.Component{

  constructor(props) {
    super(props);
    this.state = {
      isLoadingAlt: Auth.selected_user.is_using_ai,
      generatedAltText: "",
      copyButtonTitle: "Copy Text"
    };
    
    if (Auth.selected_user.is_using_ai) {
      this._download_image_info();
    }
  }

  navigationButtonPressed = async ({ buttonId }) => {
    if (buttonId === 'remove_image') {
      const { asset, index } = this.props;
      this._handle_image_remove(asset, index);
    }
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
            onPress: () => {
              // delay, seems to create problems otherwise
              setTimeout(() => {
                Navigation.popToRoot(this.props.componentId);
                posting.remove_asset(index)
              }, 500);
            },
            style: 'destructive'
          },
        ],
        {cancelable: false},
      );
    }
  }
  
  _download_image_info = (remaining_count = 10) => {
    const posting = Auth.selected_user.posting;
    const service = posting.selected_service.service_object();
    const destination = service.destination;

    MicroPubApi.get_uploads(service, destination).then(results => {
      let found = this._check_uploads_for_text(results);
      if (!found && (remaining_count > 0)) {
        // if alt text not found, wait and try again
        setTimeout(() => {
          this._download_image_info(remaining_count - 1);
        }, 4000);
      }
    });
  }

  _check_uploads_for_text(results) {
    const { asset } = this.props;
    let found = false;
    
    if (results.items != null) {
      for (let item of results.items) {
        if (item.url == asset.remote_url) {
          if (item.alt.length > 0) {
            found = true;
            this.setState({ isLoadingAlt: false, generatedAltText: item.alt });
          }
        }
      }
    }
    
    return found;
  }

  render() {
    const { posting } = Auth.selected_user
    const { asset } = this.props
        
    const max_media_height = 250; // cap media height
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
      <KeyboardAvoidingView behavior={"padding"} style={{ flex: 1, backgroundColor: App.theme_background_color() }}>
        <ScrollView contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', width: "100%" }}>
          <View
            style={{
              flex: 1,
              width: '100%',
              height: '100%',
              position: 'relative',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: App.theme_background_color(),
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
                </>
              : null
            }
          </View>
          <View style={{ width: "100%", justContent: "left" }}>
            <View
              style={{
                width: `${ asset.progress }%`,
                height: 5,
                backgroundColor: asset.is_uploading ? App.theme_accent_color() : "transparent"
              }}
            />
          </View>
          { (this.state.isLoadingAlt || (this.state.generatedAltText.length > 0)) && 
            <View style={{ flexDirection: "row", minHeight: 40, alignItems: "center", width: "100%", padding: 8 }}>
              { this.state.isLoadingAlt ? 
                <>
                  <Text numberOfLines={1} style={{ color: App.theme_text_color() }}>🤖</Text>
                  <ActivityIndicator color="#f80" size={"small"} style={{ paddingLeft: 5 }} />
                </>
              :
                <>
                  <Text numberOfLines={1} style={{ flex: 1, color: App.theme_text_color() }}>🤖 {this.state.generatedAltText}</Text>
                  <TouchableOpacity
                    style={{
                      marginLeft: 5,
                      padding: 4,
                      paddingLeft: 6,
                      paddingRight: 6,
                      backgroundColor: App.theme_button_background_color(),
                      borderRadius: 20,
                      borderColor: App.theme_section_background_color(),
                      borderWidth: 1
                    }}
                    onPress={() => {
                      Clipboard.setString(this.state.generatedAltText);
                      this.setState({ copyButtonTitle: "✓ Copied" });
                    }}
                  >
                    <Text style={{ fontSize: 12, color: App.theme_button_text_color() }}>{this.state.copyButtonTitle}</Text>
                  </TouchableOpacity>
                </>
              }
            </View>
          }
          
          {
            !asset.is_video &&
            <TextInput
              placeholder="Accessibility description"
              placeholderTextColor={App.theme_placeholder_alt_text_color()}
              style={{
                fontSize: 16,
                padding: 8,
                paddingBottom: 143, // enlarge textinput click area; arbitrary number
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
