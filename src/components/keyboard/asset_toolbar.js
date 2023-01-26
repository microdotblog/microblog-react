import * as React from 'react';
import { observer } from 'mobx-react';
import { View, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import Auth from '../../stores/Auth';

@observer
export default class AssetToolbar extends React.Component{
  
  render() {
    const { posting } = Auth.selected_user
    if(posting.post_assets.length > 0){
      return(
        <View
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
        >
          {
            posting.post_assets.map((asset, index) => (
              <TouchableOpacity
                onPress={() => posting.image_option_screen(asset, index, this.props.componentId)}
                key={asset.uri}
                style={{
                  marginRight: 4,
                  position: 'relative',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 50,
                  height: 50
                }}>
                <Image source={{ uri: asset.remote_url ? asset.remote_url : asset.uri }} style={{ width: 50, height: 50, borderRadius: 5, backgroundColor: '#E5E7EB' }} />
                {
                  asset.is_uploading ?
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
                        borderRadius: 5
                      }}>
                      <ActivityIndicator color="#f80"/>
                    </View>
                  : null
                }
              </TouchableOpacity>
            ))
          }
        </View>
      )
    }
    return null
  }
  
}