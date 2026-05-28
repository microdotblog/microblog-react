import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import ActionSheet from "react-native-actions-sheet";
import Reporting from '../../stores/Reporting'
import Auth from '../../stores/Auth';
import App from '../../stores/App'

@observer
export default class ProfileMoreMenu extends React.Component{
  
  render() {
    if (Auth.selected_user == null) { return null; }
    
    const username = this.props.payload.username
    const is_muted = Auth.selected_user.muting?.is_muted(username)
    const is_blocked = Auth.selected_user.muting?.blocked_users.some(u => u.username === username)
    const is_loading = Auth.selected_user.muting?.is_sending_mute || Auth.selected_user.muting?.is_sending_unmute

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
            borderRadius: 16
          }}
        >
          <View style={{width: "100%", marginBottom: 15}}>
            <Text style={{ fontWeight: '700', marginBottom: 5, color: App.theme_text_color() }}>Muting & Blocking</Text>
            <Text style={{ fontWeight: '400', marginBottom: 25, color: App.theme_text_color() }}>
              You can mute or block @{username}. When muted, their posts and replies will be hidden in your timeline. When blocked, they also won't see your posts.
            </Text>
            
            <TouchableOpacity
              onPress={() => {
                if (is_muted) {
                  Auth.selected_user.muting?.unmute_item(Auth.selected_user.muting.get_mute_id(username))
                } else {
                  Auth.selected_user.muting?.mute_user(username)
                }
              }}
              style={{ 
                padding: 8,
                paddingHorizontal: 16,
                borderRadius: 20,
                backgroundColor: App.theme_button_background_color(),
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                alignSelf: 'flex-start',
                borderColor: App.theme_section_background_color(),
                borderWidth: 1
              }}
              disabled={is_loading}
            >
              {
                is_loading ?
                  <ActivityIndicator size="small" color="#1F2937" />
                  :
                  <Text style={{ fontSize: 16, fontWeight: '500', color: App.theme_button_text_color() }}>
                    {is_muted ? `Unmute @${username}` : `Mute @${username}`}
                  </Text>
              }
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (is_blocked) {
                  Auth.selected_user.muting?.unmute_item(Auth.selected_user.muting.get_mute_id(username))
                } else {
                  Auth.selected_user.muting?.mute_user(username, true)
                }
              }}
              style={{ 
                padding: 8,
                paddingHorizontal: 16,
                borderRadius: 20,
                backgroundColor: "#F87171",
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                alignSelf: 'flex-start',
                opacity: is_loading ? 0.7 : 1
              }}
              disabled={is_loading}
            >
              {
                is_loading ?
                  <ActivityIndicator size="small" color="#fff" />
                  :
                  <Text style={{ fontSize: 16, fontWeight: '500', color: "#fff" }}>
                    {is_blocked ? `Unblock @${username}` : `Block @${username}`}
                  </Text>
              }
            </TouchableOpacity>
          </View>

          <View style={{width: "100%", marginBottom: 25}}>
            <Text style={{ fontWeight: '700', marginBottom: 5, color: App.theme_text_color() }}>Reporting</Text>
            <TouchableOpacity style={{marginBottom: 25}} onPress={() => App.open_url(App.guidelines_url)}>
              <Text style={{ fontWeight: '400', color: App.theme_text_color() }}>When reporting, we'll look at this user's posts to determine if they violate our <Text style={{fontWeight: "600", color: App.theme_text_color(), textDecorationLine: "underline"}}>community guidelines</Text>.</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={Reporting.is_sending_report}
              onPress={() => Reporting.report_user(username)}
              style={{ 
                padding: 8,
                paddingHorizontal: 16,
                borderRadius: 20,
                backgroundColor: "#F87171",
                marginBottom: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                alignSelf: 'flex-start'
              }}
            >
              {
                Reporting.is_sending_report ?
                  <ActivityIndicator size="small" color="#fff" />
                  :
                  <Text style={{ fontSize: 16, fontWeight: '500', color: 'white' }}>Report @{username}</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </ActionSheet>
    )
  }
}
