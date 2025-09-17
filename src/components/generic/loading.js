import * as React from 'react';
import { View, ActivityIndicator } from 'react-native';
import App from '../../stores/App';

export default class LoadingComponent extends React.Component{

  render() {
    const { should_show } = this.props
    if (!should_show) return null
    return(
      <View 
        style={{ 
          position: 'absolute',
          top: 0,
          height: '100%',
          width: '100%',
          zIndex: 10,
          backgroundColor: App.theme_background_color(),
          opacity: 0.8
        }} 
      >
        <View style={{
          height: 200,
          justifyContent: 'center',
          alignItems: 'center'              
        }}>
          <ActivityIndicator color={App.theme_accent_color()} size={'large'} />
        </View>
      </View>
    )
  }

}
