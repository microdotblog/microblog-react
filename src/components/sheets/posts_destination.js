import * as React from 'react';
import { useRef } from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import ActionSheet, { useScrollHandlers, ActionSheetRef} from "react-native-actions-sheet";
import Auth from '../../stores/Auth';
import App from '../../stores/App'
import CheckmarkIcon from '../../assets/icons/checkmark.png';

@observer
export default class PostsDestinationMenu extends React.Component{
  
  constructor(props){
    super(props);
    this.actionSheetRef = useRef<ActionSheetRef>(null)
    this.scrollHandlers = useScrollHandlers<ScrollView>(
      "destination-scroll",
      this.actionSheetRef
    )
  }
  
  _render_destinations = () => {
    const { selected_service } = Auth.selected_user.posting
    const { config } = selected_service
    return config.destination.map((destination, index, array) => {
      const is_last = index === array.length - 1;
      const is_selected_blog = config.posts_destination() === destination
      return(
        <TouchableOpacity
          key={destination.uid}
          onPress={() => selected_service.set_active_posts_destination(destination)}
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
  
  render() {
    if (Auth.selected_user == null) { return null; }
    return(
      <ActionSheet
        ref={this.actionSheetRef}
        id={this.props.sheetId}
        useBottomSafeAreaPadding={true}
        gestureEnabled={true}
        containerStyle={{
          backgroundColor: App.theme_background_color()
        }}
      >
        <ScrollView style={{maxHeight: 700, paddingBottom: 15}} {...this.scrollHandlers}>
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
              {this._render_destinations()}
            </View>
          </View>
        </ScrollView>
      </ActionSheet>
    )
  }
  
}