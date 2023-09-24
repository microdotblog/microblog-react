import ActionSheet from "react-native-actions-sheet";
import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, ScrollView } from 'react-native';
import App from '../../stores/App';
import PushNotifications from "../push/push_notifications";

@observer
export default class NotificationsSheetMenu extends React.Component{
  
  render() {
    return(
      <ActionSheet
        id={this.props.sheetId}
        overdrawEnabled={true}
        //useBottomSafeAreaPadding={true}
        overlayColor={"transparent"}
        statusBarTranslucent={true}
        isModal={false}
        gestureEnabled={true}
        containerStyle={{
          backgroundColor: App.theme_background_color_secondary(),
          padding: 15,
          borderRadius: 16,
        }}
      >
        <View style={{ marginBottom: 15 }}>
          <Text>Notifications</Text>
        </View>
        <ScrollView
          style={{
            
            backgroundColor: App.theme_background_color_secondary(),
            minHeight: 300
          }}
        >
          
          <PushNotifications />
        </ScrollView>
      </ActionSheet>
    )
  }
  
}