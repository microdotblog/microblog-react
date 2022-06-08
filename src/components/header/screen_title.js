import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, Platform } from 'react-native';
import ProfileImage from './profile_image';
import App from '../../stores/App'

@observer
export default class ScreenTitle extends React.Component{
  
  render() {
		if (this.props.title) {
			return (
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center'
					}}
				>
					{ Platform.OS === 'android' && <ProfileImage /> }
					<Text style={{ color: App.theme_text_color(), fontSize: 18, minWidth: 100, fontWeight:  Platform.OS === 'ios' ? '600' : '400' , textAlign: Platform.OS === 'ios' ? 'center' : 'auto' }}>{this.props.title}</Text>
				</View>
			)
		}
    return null
  }
  
}