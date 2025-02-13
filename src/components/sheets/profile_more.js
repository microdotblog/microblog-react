import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import ActionSheet from "react-native-actions-sheet";
import { SFSymbol } from "react-native-sfsymbols"
import { SvgXml } from "react-native-svg"
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
          <Text style={{ fontWeight: '800', marginBottom: 25, color: App.theme_text_color() }}>Muting & Reporting</Text>
          <View style={{width: "100%", marginBottom: 15}}>
            <Text style={{ fontWeight: '700', marginBottom: 5, color: App.theme_text_color() }}>Muting & Blocking</Text>
            <Text style={{ fontWeight: '400', marginBottom: 25, color: App.theme_text_color() }}>
              You can mute or block @{username}. When muted, their posts and replies will be hidden in your timeline. When blocked, you won't see any of their content or interactions.
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
                Platform.OS === "ios" ?
                  <SFSymbol
                    name="speaker.slash"
                    color={App.theme_button_text_color()}
                    style={{ height: 20, width: 20, marginRight: 8 }}
                  />
                :
                  <SvgXml
                    style={{ height: 20, width: 20, marginRight: 8 }}
                    color={App.theme_button_text_color()}
                    xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>'
                  />
              }
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
                Platform.OS === "ios" ?
                  <SFSymbol
                    name="slash.circle"
                    color="#fff"
                    style={{ height: 20, width: 20, marginRight: 8 }}
                  />
                :
                  <SvgXml
                    style={{ height: 20, width: 20, marginRight: 8 }}
                    color="#fff"
                    xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>'
                  />
              }
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
                Platform.OS === "ios" ?
                  <SFSymbol
                    name="exclamationmark.triangle"
                    color="#fff"
                    style={{ height: 20, width: 20, marginRight: 8 }}
                  />
                :
                  <SvgXml
                    style={{ height: 20, width: 20, marginRight: 8 }}
                    color="#fff"
                    xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>'
                  />
              }
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