import * as React from 'react';
import { observer } from 'mobx-react';
import Push from '../../stores/Push'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import App from '../../stores/App'

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
                alignItems: 'center'
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
              <TouchableOpacity onPress={() => Push.check_and_remove_notifications_with_post_id(notification.post_id)}><Text style={{color: App.theme_text_color(), fontSize: 20}}>X</Text></TouchableOpacity>
            </View>
            <Text style={{fontSize: 16, maxWidth: '90%', color: App.theme_text_color()}}>{notification.trimmed_message()}</Text>
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
