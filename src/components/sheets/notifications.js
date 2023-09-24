import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import App from '../../stores/App';
import PushNotifications from "../push/push_notifications";
import ActionSheet from "react-native-actions-sheet";
import Push from '../../stores/Push';

@observer
export default class NotificationsSheetMenu extends React.Component{
  
  render() {
    return(
      <ActionSheet
        snapPoints={[40,95]}
        initialSnapIndex={[1]}
        id={this.props.sheetId}
        overdrawEnabled={true}
        overlayColor={"transparent"}
        isModal={false}
        gestureEnabled={true}
        onOpen={() => Push.toggle_notifications_open(true)}
        onClose={() => Push.toggle_notifications_open(false)}
        containerStyle={{
          backgroundColor: App.theme_background_color_secondary(),
          padding: 15,
          borderRadius: 16
        }}
      >
        <View style={{ marginBottom: 15, justifyContent: "space-between", flexDirection: "row" }}>
          <Text style={{color: App.theme_text_color()}}>Notifications</Text>
          <TouchableOpacity onPress={Push.remove_all_notifications}>
            <Text style={{color: App.theme_text_color()}}>Clear all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          style={{ 
            backgroundColor: App.theme_background_color_secondary(),
            maxHeight: 500
          }}
          contentContainerStyle={{
            marginBottom: 100
          }}
        >
          <PushNotifications />
        </ScrollView>
      </ActionSheet>
    )
  }
  
}