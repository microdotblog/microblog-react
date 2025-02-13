import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { SFSymbol } from "react-native-sfsymbols"
import { SvgXml } from "react-native-svg"
import Auth from '../../stores/Auth';
import App from '../../stores/App';

@observer
export default class MutedMessage extends React.Component{
  
  render() {
    const is_blocked = Auth.selected_user?.muting?.blocked_users.some(u => u.username === this.props.username)
    const mute_id = Auth.selected_user?.muting?.get_mute_id(this.props.username)
    const is_loading = Auth.selected_user?.muting?.is_sending_unmute

    return(
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {
          this.props.title ?
            <Text style={{ fontWeight: '600', fontSize: 18, marginBottom: 15, color: App.theme_text_color() }}>{this.props.title}</Text>
          : null
        }
        <TouchableOpacity
          onPress={() => Auth.selected_user?.muting?.unmute_item(mute_id)}
          style={{ 
            padding: 8,
            paddingHorizontal: 16,
            borderRadius: 20,
            backgroundColor: is_blocked ? "#F87171" : App.theme_button_background_color(),
            marginTop: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            opacity: is_loading ? 0.7 : 1
          }}
          disabled={is_loading}
        >
          {
            Platform.OS === "ios" ?
              <SFSymbol
                name={is_blocked ? "slash.circle" : "speaker.slash"}
                color={is_blocked ? "#fff" : App.theme_button_text_color()}
                style={{ height: 20, width: 20, marginRight: 8 }}
              />
            :
              <SvgXml
                style={{ height: 20, width: 20, marginRight: 8 }}
                color={is_blocked ? "#fff" : App.theme_button_text_color()}
                xml={is_blocked ? 
                  '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>'
                  :
                  '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>'
                }
              />
          }
          {
            is_loading ?
              <ActivityIndicator size="small" color={is_blocked ? "#fff" : "#1F2937"} />
              :
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '500', 
                color: is_blocked ? "#fff" : App.theme_button_text_color() 
              }}>
                {is_blocked ? `Unblock @${this.props.username}` : `Unmute @${this.props.username}`}
              </Text>
          }
        </TouchableOpacity>
      </View>
    )
  }
}