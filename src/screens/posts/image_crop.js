import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text } from 'react-native';
import { Navigation } from 'react-native-navigation';

@observer
export default class ImageCropScreen extends React.Component{
  render() {
	  return (
		  <View>
		  	<Text>Hi</Text>
		  </View>
	  )
  }
}