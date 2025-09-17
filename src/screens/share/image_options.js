import * as React from 'react';
import { observer } from 'mobx-react';
import { View, ScrollView, Image, ActivityIndicator, TextInput, Dimensions } from 'react-native';
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import App from '../../stores/App'
import Share from '../../stores/Share'

@observer
export default class ShareImageOptionsScreen extends React.Component{

  constructor(props) {
    super(props);
    const { asset } = this.props

    const max_media_height = 250; // cap media height
    const window_width = Dimensions.get('window').width;
    let media_width = window_width;
    let media_height = window_width; // default to 1:1
    
    this.state = {
      media_width: media_width,
      media_height: media_height,
    };
    
    Image.getSize(asset.uri, (width, height) => {
      const aspect_ratio = width / height;
      media_height = window_width / aspect_ratio;
      
      if (media_height > max_media_height) {
        media_height = max_media_height;
        media_width = max_media_height * aspect_ratio;
      }
      
      this.setState({ media_width: media_width, media_height: media_height });
    });
  }
  
  render() {
    const { posting } = Share.selected_user
    const { asset } = this.props
    
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
              backgroundColor: App.theme_background_color
            }}
          >
            <Image source={{ uri: asset.remote_url ? asset.remote_url : asset.uri }} style={{ width: this.state.media_width, height: this.state.media_height }} />
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
                fontSize: 16,
                padding: 8,
                paddingBottom: 143, // enlarge textinput click area; arbitrary number
                marginVertical: 8,
                fontWeight: '400',
                color: App.theme_text_color(),
                width: "100%",
              }}
              editable={!posting.is_sending_post}
              multiline={true}
              scrollEnabled={true}
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
