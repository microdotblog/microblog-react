import * as React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import App from '../../stores/App';

export default class LoadingComponent extends React.Component{

  render() {
    const { should_show, message, size = 'large' } = this.props
    if (!should_show) return null
    return(
      <View 
        style={{ 
          position: 'absolute',
          top: 0,
          height: '100%',
          width: '100%',
          zIndex: 20,
          backgroundColor: App.theme_background_color(),
          opacity: 0.8
        }} 
      >
        <View style={{
          height: message ? 125 : 200,
          justifyContent: 'center',
          alignItems: 'center'              
        }}>
          <ActivityIndicator color={App.theme_accent_color()} size={size} />
          {
            message && <Text style={{ color: App.theme_text_color(), fontSize: 16, marginTop: 10 }}>{message}</Text>
          }
        </View>
      </View>
    )
  }

}
