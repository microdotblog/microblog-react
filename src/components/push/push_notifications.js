import * as React from 'react';
import { observer } from 'mobx-react';
import Push from '../../stores/Push'
import { View, Text, TouchableOpacity, Image, Platform } from 'react-native'
import App from '../../stores/App'
import { SFSymbol } from "react-native-sfsymbols";

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
              borderTopWidth: 2,
              borderTopColor: '#ccc',
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'space-between'
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
                    style={{ height: 20, width: 20 }}
                  />
                : <Text style={{ color: App.theme_text_color(), fontSize: 22 }}>X</Text>
              }
              
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      )
    })
  }

  render() {
    return Push.valid_notifications() ?
      <View style={{ position: 'absolute', bottom: 0, width: '100%' }}>
        {this._render_notifications()}
      </View>
      : null
  }

}
