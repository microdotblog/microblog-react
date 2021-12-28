import * as React from 'react';
import { observer } from 'mobx-react';
import { View, TextInput, Keyboard, ActivityIndicator, Text, TouchableOpacity, Image } from 'react-native';
import { Navigation } from 'react-native-navigation';
import Auth from '../../stores/Auth';
import PhotoLibrary from '../../assets/icons/toolbar/photo_library.png';

@observer
export default class PostingScreen extends React.Component{
  
  constructor(props) {
		super(props)
		Navigation.events().bindComponent(this);
    this._text_selection = { start: 0, end: 0 }
	}
  
  navigationButtonPressed = async ({ buttonId }) => {
    console.log("navigationButtonPressed::", buttonId)
    if(buttonId === "post_button"){
      const sent = await Auth.selected_user.posting.send_post()
      if(sent){
        this._dismiss()
      }
    }
    else{
      this._dismiss()
    }
  }
  
  _dismiss = () => {
    Keyboard.dismiss()
		Navigation.dismissModal(this.props.componentId)
	}
  
  render() {
    const { posting } = Auth.selected_user
    return(
      <View style={{ flex: 1 }}>
        {
          posting.post_text_length() > 280 || posting.post_title ?
          <TextInput
            placeholder="Optional post title"
            placeholderTextColor="lightgrey"
            style={{
              fontSize: 18,
              justifyContent: 'flex-start',
						  alignItems: 'flex-start',
              padding: 8,
              marginBottom: -5,
              fontWeight: '700',
              borderColor: '#E5E7EB',
              borderBottomWidth: .5
            }}
            editable={!posting.is_sending_post}
            multiline={false}
            scrollEnabled={false}
            returnKeyType={'default'}
					  keyboardType={'default'}
					  autoFocus={false}
					  autoCorrect={true}
					  clearButtonMode={'while-editing'}
					  enablesReturnKeyAutomatically={true}
					  underlineColorAndroid={'transparent'}
            value={posting.post_title}
            onChangeText={(text) => !posting.is_sending_post ? posting.set_post_title(text) : null}
          />
          : null
        }
        <TextInput
          placeholderTextColor="lightgrey"
          style={{
            fontSize: 18,
            justifyContent: 'flex-start',
						alignItems: 'flex-start',
            marginBottom: posting.post_text_length() > 280 || posting.post_title ? 80 : 38,
            padding: 8,
          }}
          editable={!posting.is_sending_post}
          multiline={true}
          scrollEnabled={true}
          returnKeyType={'default'}
					keyboardType={'default'}
					autoFocus={true}
					autoCorrect={true}
					clearButtonMode={'while-editing'}
					enablesReturnKeyAutomatically={true}
					underlineColorAndroid={'transparent'}
          value={posting.post_text}
          onChangeText={(text) => !posting.is_sending_post ? posting.set_post_text(text) : null}
          onSelectionChange={({ nativeEvent: { selection } }) => {
            this._text_selection = selection
          }}
        />
        {
          posting.post_images.length > 0 ?
            <View
              style={{
                position: 'absolute',
                bottom: 40,
                flexDirection: 'row',
                padding: 8
              }}
            >
              {
                posting.post_images.map((image) => (
                  <View key={image.uri} style={{ marginRight: 4, position: 'relative', justifyContent: 'center', alignItems: 'center', width: 50, height: 50 }}>
                    <Image source={{ uri: image.remote_url ? image.remote_url : image.uri }} style={{ width: 50, height: 50, borderRadius: 5 }} />
                    {
                      image.is_uploading ?
                        <ActivityIndicator color="#f80" style={{position: 'absolute'}} />
                      : null
                    }
                  </View>
                ))
              }
            </View>
          : null
        }
        <View
          style={{
            width: '100%',
            backgroundColor: '#E5E7EB',
            position: 'absolute',
            bottom: 0,
            right: 0,
            left: 0,
            padding: 5,
            minHeight: 40,
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <TouchableOpacity style={{minWidth: 35}} onPress={() => posting.handle_text_action("**", this._text_selection)}>
            <Text style={{ fontSize: 20, fontWeight: '700', textAlign: 'center', padding: 2 }}>{"**"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{minWidth: 35}} onPress={() => posting.handle_text_action("_", this._text_selection)}>
            <Text style={{ fontSize: 20, fontWeight: '800', textAlign: 'center', padding: 2 }}>{"_"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{minWidth: 35}} onPress={() => posting.handle_text_action("[]", this._text_selection)}>
            <Text style={{ fontSize: 20, fontWeight: '600', textAlign: 'center', padding: 2 }}>{"[ ]"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{minWidth: 35, marginLeft: 8, marginRight: 8}} onPress={posting.handle_image_action}>
            <Image source={PhotoLibrary} style={{width: 24, height: 24}} />
          </TouchableOpacity>
          {/* {
            posting.selected_service.config.has_multiple_destinations() ?
            <TouchableOpacity style={{ marginLeft: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: '400', textAlign: 'center', padding: 2 }}>{posting.selected_service.config.active_destination().name}</Text>
            </TouchableOpacity>
            : null
          } */}
          <Text
            style={{
              fontWeight: '200',
              position: 'absolute',
              right: 8,
              bottom: 9,
              padding: 2,
              backgroundColor: 'rgba(255,255,255,.6)'
            }}
          ><Text style={{ color: posting.post_text_length() > 280 ? '#a94442' : 'black' }}>{posting.post_text_length()}</Text>/280</Text>
        </View>
        {
          posting.is_sending_post ?
          <View 
            style={{ 
              position: 'absolute',
              top: 0,
              bottom:0,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.6)',
              zIndex: 10
            }} 
          >
            <ActivityIndicator color="#f80" size={'large'} />
          </View>
          : null
        }
        
      </View>
    )
  }
  
}