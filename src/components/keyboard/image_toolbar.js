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
                <Image source={{ uri: image.remote_url ? image.remote_url : image.uri }} style={{ width: 50, height: 50, borderRadius: 5, backgroundColor: '#E5E7EB', opacity: image.is_uploading ? .5 : 1 }} />
                {
                  image.is_uploading ?
                    <ActivityIndicator color="#f80" style={{position: 'absolute'}} />
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