import * as React from 'react';
import { observer } from 'mobx-react';
import { View, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import Auth from '../../stores/Auth';

@observer
export default class ImageToolbar extends React.Component{
  
  render() {
    const { posting } = Auth.selected_user
    if(posting.post_images.length > 0){
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
            posting.post_images.map((image, index) => (
              <TouchableOpacity
                onPress={() => posting.image_option_screen(image, index, this.props.componentId)}
                key={image.uri}
                style={{
                  marginRight: 4,
                  position: 'relative',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 50,
                  height: 50
                }}>
                <Image source={{ uri: image.remote_url ? image.remote_url : image.uri }} style={{ width: 50, height: 50, borderRadius: 5, backgroundColor: '#E5E7EB' }} />
                {
                  image.is_uploading ?
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