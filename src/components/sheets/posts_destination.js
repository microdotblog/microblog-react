import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import ActionSheet from "react-native-actions-sheet";
import Auth from '../../stores/Auth';
import App from '../../stores/App'
import CheckmarkIcon from '../../assets/icons/checkmark.png';

@observer
export default class PostsDestinationMenu extends React.Component{
  
  render() {
    if (Auth.selected_user == null) { return null; }
    const { selected_service } = Auth.selected_user.posting
    const { config } = selected_service
    return(
      <ActionSheet
        id={this.props.sheetId}
        useBottomSafeAreaPadding={true}
        gestureEnabled={true}
        containerStyle={{
          backgroundColor: App.theme_background_color_secondary()
        }}
      >
        <View
          style={{
            padding: 15,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 16,
            marginBottom: 25
          }}
        >
          <Text style={{ fontWeight: '800', marginBottom: 25, color: App.theme_text_color() }}>Select a blog</Text>
          <View style={{ backgroundColor: App.theme_button_background_color(), padding: 8, borderRadius: 8, marginTop: 8 }}>
          {
            config.destination.map((destination) => {
              const is_selected_blog = config.posts_destination() === destination
              return(
                <TouchableOpacity
                  key={destination.uid}
                  onPress={() => selected_service.set_active_posts_dettination(destination)}
                  style={{
                    padding: 8,
                    marginBottom: 5,
                  }}
                >
                  <Text style={ is_selected_blog ? { fontWeight: '600', color: App.theme_button_text_color() } : { color: App.theme_button_text_color() }}>
                    {destination.name}
                    {
                      is_selected_blog ?
                        <Image source={CheckmarkIcon} style={{ width: 15, height: 15, tintColor: App.theme_button_text_color() }} />
                      : null
                    }
                  </Text>
                </TouchableOpacity>
              )
            }
            )
          }
          </View>
        </View>
      </ActionSheet>
    )
  }
  
}