import ActionSheet from "react-native-actions-sheet";
import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import Auth from './../../stores/Auth';
import AccountSwitcher from '../menu/account_switcher'
import MenuNavigation from '../menu/nav'
import App from '../../stores/App';

@observer
export default class SheetMenu extends React.Component{
  
  render() {
    return(
      <ActionSheet
        id={this.props.sheetId}
        snapPoints={[ 50, 100 ]}
        initialSnapIndex={1}
        overdrawEnabled={true}
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
            backgroundColor: App.theme_background_color_secondary()
          }}
        >
          <MenuNavigation />
          {
            Auth.selected_user != null ?
              <AccountSwitcher />
              :
              <TouchableOpacity
                onPress={App.navigate_to_screen("Login")}
                style={{
                  padding: 8,
                  paddingHorizontal: 16,
                  backgroundColor: App.theme_button_background_color(),
                  borderRadius: 5,
                }}
              >
                <Text style={{ fontWeight: "700", color: "orange" }}>Please sign in to continue</Text>
              </TouchableOpacity>
          }
          
        </View>
      </ActionSheet>
    )
  }
  
}