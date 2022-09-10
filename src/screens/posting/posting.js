import * as React from 'react';
import { observer } from 'mobx-react';
import { View, TextInput, Keyboard, ActivityIndicator, TouchableOpacity, Image, InputAccessoryView, Platform } from 'react-native';
import { Navigation } from 'react-native-navigation';
import Auth from '../../stores/Auth';
import PostToolbar from '../../components/keyboard/post_toolbar'
import App from '../../stores/App'

@observer
export default class PostingScreen extends React.Component{
  
  constructor(props) {
		super(props)
		Navigation.events().bindComponent(this);
    this.input_accessory_view_id = "input_toolbar";
  }
  
  componentDidMount() {
    if (Auth.selected_user.posting.selected_service != null) {
      Auth.selected_user.posting.selected_service.check_for_categories()
    }
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
      <View style={{ flex: 1, backgroundColor: App.theme_background_color() }}>
        {
          posting.post_text_length() > 280 || posting.post_title ?
          <TextInput
            placeholder="Title"
            placeholderTextColor={App.theme_placeholder_text_color()}
            style={{
              fontSize: 18,
              justifyContent: 'flex-start',
						  alignItems: 'flex-start',
              padding: 8,
              marginBottom: 4,
              fontWeight: '700',
              borderColor: App.theme_border_color(),
              borderBottomWidth: .5,
              color: App.theme_text_color()
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
            inputAccessoryViewID={this.input_accessory_view_id}
          />
          : null
        }
        <TextInput
          placeholderTextColor="lightgrey"
          style={{
            fontSize: 18,
            justifyContent: 'flex-start',
						alignItems: 'flex-start',
            marginTop: 3,
            marginBottom: posting.post_text_length() > 280 || posting.post_title ? posting.post_images.length > 0 ? 135 : 80 : posting.post_images.length > 0 ? 93 : 38,
            padding: 8,
            color: App.theme_text_color()
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
            posting.set_text_selection(selection)
          }}
          inputAccessoryViewID={this.input_accessory_view_id}
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
                posting.post_images.map((image, index) => (
                  <TouchableOpacity
                    onPress={() => posting.image_action(image, index)}
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
                        <ActivityIndicator color="#f80" style={{position: 'absolute'}} />
                      : null
                    }
                  </TouchableOpacity>
                ))
              }
            </View>
          : null
        }
        {
          Platform.OS === 'ios' ?
            <InputAccessoryView nativeID={this.input_accessory_view_id}>
              <PostToolbar componentId={this.props.componentId} />
            </InputAccessoryView>
          :  <PostToolbar componentId={this.props.componentId} />
        }
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
              backgroundColor: App.theme_opacity_background_color(),
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