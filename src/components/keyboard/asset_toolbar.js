import * as React from 'react';
import { observer } from 'mobx-react';
import { View, TouchableOpacity, ActivityIndicator, Platform, ScrollView } from 'react-native';
import Auth from '../../stores/Auth';
import App from '../../stores/App'
import Share from '../../stores/Share'
import MBImage from '../common/MBImage'

@observer
export default class AssetToolbar extends React.Component{

  state = {
    failed_preview_uris: {}
  }

  image_uri_for_asset(uri, remote_url) {
    if (uri && !this.state.failed_preview_uris[uri]) {
      return uri
    }
    return remote_url ? remote_url : uri
  }

  handle_image_error(uri, remote_url) {
    if (!uri || !remote_url || this.state.failed_preview_uris[uri]) {
      return
    }
    this.setState({
      failed_preview_uris: {
        ...this.state.failed_preview_uris,
        [uri]: true
      }
    })
  }
  
  render() {
    const { posting } = this.props.posting != null ? this.props : Auth.selected_user
    if(posting.post_assets.length > 0){
      return(
        <ScrollView
          horizontal
          style={{
            flexDirection: 'row',
            marginTop: 4,
            padding: 8
          }}
          contentContainerStyle={{
            paddingRight: 12
          }}
        >
          {
            posting.post_assets.map((asset, index) => {
              const asset_uri = asset.uri
              const asset_remote_url = asset.remote_url
              const image_uri = this.image_uri_for_asset(asset_uri, asset_remote_url)
              const video_poster_uri = asset.remote_poster_url ? asset.remote_poster_url : asset.uri
              const label = asset.alt_text || asset.original_filename || `${asset.is_video ? 'Video' : 'Attachment'} ${index + 1}`
              const can_inline = asset.remote_url != null && !asset.is_video
              const long_press_action = asset.is_uploading
                ? { name: 'cancelUpload', label: 'Cancel upload' }
                : can_inline ? { name: 'insertAttachment', label: 'Insert into post' } : null
              const handle_long_press = () => {
                if (asset.is_uploading) {
                  asset.cancel_upload()
                  posting.remove_asset(index)
                }
                else if (can_inline) {
                  posting.inline_asset(asset)
                }
              }

              return (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  accessibilityHint={asset.is_uploading ? undefined : 'Open attachment options'}
                  accessibilityValue={asset.is_uploading ? { text: 'Uploading' } : undefined}
                  accessibilityActions={long_press_action ? [long_press_action] : undefined}
                  onAccessibilityAction={({ nativeEvent }) => {
                    if (nativeEvent.actionName === long_press_action?.name) {
                      handle_long_press()
                    }
                  }}
                  onPress={() => {
                    if (asset.is_uploading) {
                      return; // Prevent navigation during upload
                    }
                    App.is_share_extension ? Share.trigger_image_options(asset) : posting.asset_option_screen(asset, index)
                  }}
                  onLongPress={handle_long_press}
                  key={`${asset.uri}-${index}`}
                  style={{
                    marginRight: 4,
                    position: 'relative',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 50,
                    height: 50
                  }}>
                  {
                    asset.is_video ?
                    <>
                      <MBImage source={{ uri: video_poster_uri }} contentFit="cover" style={{ width: 50, height: 50, borderRadius: 5, backgroundColor: '#E5E7EB' }} />
                    </>
                    :
                    <MBImage source={{ uri: image_uri }} contentFit="cover" onError={() => this.handle_image_error(asset_uri, asset_remote_url)} style={{ width: 50, height: 50, borderRadius: 5, backgroundColor: '#E5E7EB' }} />
                  }
                  {
                    asset.is_uploading ?
                      <>
                        <View
                          style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,.6)',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 5,
                            zIndex: 1
                          }}>
                          <ActivityIndicator animating={true} color={App.theme_accent_color()}/>
                        </View>
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
                </TouchableOpacity>
              )
            })
          }
        </ScrollView>
      )
    }
    return null
  }
  
}
