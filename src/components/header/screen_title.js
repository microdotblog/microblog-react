import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text } from 'react-native';
import ProfileImage from './profile_image';

@observer
export default class ScreenTitle extends React.Component{
  
  render() {
		if (this.props.title) {
			return (
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
					}}
				>
					<ProfileImage />
					<Text style={{ color: 'black', fontSize: 18, minWidth: 100 }}>{this.props.title}</Text>
				</View>
			)
		}
    return null
  }
  
}