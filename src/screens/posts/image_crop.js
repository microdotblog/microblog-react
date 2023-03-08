import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, Image } from 'react-native';
import { Navigation } from 'react-native-navigation';

@observer
export default class ImageCropScreen extends React.Component{
  render() {
	  const { asset } = this.props
	  return (
		<View>
			<Image source={{ uri: asset.uri }} style={{ width: "100%", height: 300 }} />
		</View>
	  )
  }
}