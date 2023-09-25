import * as React from 'react';
import { observer } from 'mobx-react';
import { View, TouchableOpacity, Image, ActivityIndicator, Platform, ScrollView } from 'react-native';
import Auth from '../../stores/Auth';
import App from '../../stores/App'
import Share from '../../stores/Share'

@observer
export default class AssetToolbar extends React.Component{
  
  render() {
    const { posting } = App.is_share_extension ? Share.selected_user : Auth.selected_user
    if(posting.post_assets.length > 0){
      return(
        <ScrollView
          horizontal
          style={{
            ...Platform.select({
              android: {
                position: 'absolute',
                bottom: 40,
              }
            }),
            flexDirection: 'row',
            padding: 8
          }}
          contentContainerStyle={{
            paddingRight: 12
          }}
        >
          {
            posting.post_assets.map((asset, index) => (
              <TouchableOpacity
                onPress={() => App.is_share_extension ? Share.trigger_image_options(asset) : posting.asset_option_screen(asset, index, this.props.componentId)}
                onLongPress={() => !asset.is_uploading && asset.remote_url != null && !asset.is_video ? posting.inline_asset(asset) : null}
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
                    <Image source={{ uri: asset.remote_poster_url ? asset.remote_poster_url : asset.uri }} style={{ width: 50, height: 50, borderRadius: 5, backgroundColor: '#E5E7EB' }} />
                  </>
                  :
                  <Image source={{ uri: asset.remote_url ? asset.remote_url : asset.uri }} style={{ width: 50, height: 50, borderRadius: 5, backgroundColor: '#E5E7EB' }} />
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
                        <ActivityIndicator animating={true} color="#f80"/>
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
            ))
          }
        </ScrollView>
      )
    }
    return null
  }
  
}