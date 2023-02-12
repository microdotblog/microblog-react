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
          backgroundColor: App.theme_background_color()
        }}
      >
        <View
          style={{
            padding: 15,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 16,
            marginBottom: 25,
            flexDirection: "column"
          }}
        >
          <Text style={{ fontWeight: '800', marginBottom: 25, color: App.theme_text_color() }}>Select a blog</Text>
          <View style={{ paddingHorizontal: 12, backgroundColor: App.theme_settings_group_background_color(), borderRadius: 8, flexDirection: "column"}}>
            {
              config.destination.map((destination, index, array) => {
                const is_last = index === array.length - 1;
                const is_selected_blog = config.posts_destination() === destination
                return(
                  <TouchableOpacity
                    key={destination.uid}
                    onPress={() => selected_service.set_active_posts_dettination(destination)}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingVertical: 12,
                      borderBottomWidth: is_last ? 0 : 1,
                      borderColor: App.theme_border_color(),
                      minWidth: 220 // Maybe don't do this?
                    }}
                  >
                    <Text style={ is_selected_blog ? { fontWeight: '700', color: App.theme_button_text_color() } : { color: App.theme_button_text_color() }}>
                      {destination.name}
                    </Text>
                    {
                      is_selected_blog ?
                        <Image source={CheckmarkIcon} style={{ width: 15, height: 15, tintColor: App.theme_button_text_color() }} />
                      : null
                    }
                  </TouchableOpacity>
                )
              })
            }
          </View>
        </View>
      </ActionSheet>
    )
  }
  
}