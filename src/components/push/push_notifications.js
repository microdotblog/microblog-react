import * as React from 'react';
import { observer } from 'mobx-react';
import Push from '../../stores/Push'
import { View, Text, TouchableOpacity, Image, Platform } from 'react-native'
import App from '../../stores/App'
import { SFSymbol } from "react-native-sfsymbols";
import { SvgXml } from 'react-native-svg';

@observer
export default class PushNotifications extends React.Component{

  _render_notifications = () => {
    return Push.valid_notifications().map(notification => {
      return (
        <View key={notification.id}>
          <TouchableOpacity
            onPress={notification.handle_action}
            style={{
              padding: 10,
              backgroundColor: App.theme_button_background_color(),
              marginBottom: 5,
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              borderRadius: 17
            }}
            activeOpacity={.9}
          >
            <View
              style={{
                flexDirection: 'column',
                alignItems: 'center',
                marginRight: 10
              }}
            >
              {
                notification.from_avatar_url &&
                <Image
                  source={{ uri: notification.from_avatar_url }}
                  style={{
                    width: 25,
                    height: 25,
                    borderRadius: 50,
                    marginBottom: 15
                  }}
                />
              }
            </View>
            <Text style={{ fontSize: 16, width: '80%', color: App.theme_text_color(), alignSelf: 'flex-start' }}>{notification.trimmed_message()}</Text>
            <TouchableOpacity
              onPress={() => Push.check_and_remove_notifications_with_post_id(notification.post_id)}
              style={{marginLeft: 10}}
            >
              {
                Platform.OS === 'ios' ?
                  <SFSymbol
                    name={'xmark'}
                    color={App.theme_text_color()}
                    style={{ height: 18, width: 18 }}
                  />
                : 
                <SvgXml
                  height={22}
                  width={22}
                  color={App.theme_text_color()}
                  xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>'
                />
              }
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      )
    })
  }

  render() {
    return Push.valid_notifications() ? this._render_notifications() : null
  }

}
