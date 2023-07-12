import * as React from 'react';
import { observer } from 'mobx-react';
import { View, ScrollView, Image, ActivityIndicator, TextInput, KeyboardAvoidingView } from 'react-native';
import App from '../../stores/App'
import Share from '../../stores/Share'

@observer
export default class ShareImageOptionsScreen extends React.Component{
  
  render() {
    const { posting } = Share.selected_user
    const { asset } = this.props
    return(
      <KeyboardAvoidingView behavior={"height"} style={{ flex: 1, height: "100%" }}>
        <ScrollView style={{ padding: 15 }} contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', width: "100%" }}>
          <View
            style={{
              position: 'relative',
              justifyContent: 'center',
              alignItems: 'center',
              width: 250,
              height: 250,
              backgroundColor: '#E5E7EB'
            }}
          >
            <Image source={{ uri: asset.remote_url ? asset.remote_url : asset.uri }} style={{ width: 250, height: 250, borderRadius: 5 }} />
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
                paddingTop: 9,
                fontWeight: '400',
                color: App.theme_text_color(),
                marginVertical: 25,
                borderRadius: 5,
                backgroundColor: App.theme_button_background_color(),
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