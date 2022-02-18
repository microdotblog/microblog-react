import * as React from 'react';
import { observer } from 'mobx-react';
import Push from '../../stores/Push'
import { View, Text, TouchableOpacity, Image } from 'react-native'

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
              backgroundColor: '#F8F8F8',
              borderTopWidth: 2,
              borderTopColor: '#ccc',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
            activeOpacity={.9}
          >
            {
              notification.from_avatar_url &&
              <Image
                source={{ uri: notification.from_avatar_url }}
                style={{
                  width: 25,
                  height: 25,
                  marginRight: 5,
                  borderRadius: 50
                }}
              />
            }
            <Text style={{fontSize: 16, maxWidth: '90%'}}>{notification.message}</Text>
          </TouchableOpacity>
        </View>
      )
    })
  }

  render() {
    return Push.valid_notifications() ?
      <View style={{position: 'absolute', bottom: 0, width: '100%'}}>
        {this._render_notifications()}
      </View>
      : null
  }

}
