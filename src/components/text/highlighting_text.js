import * as React from 'react';
import { requireNativeComponent, Platform, TextInput } from 'react-native';

const MBHighlightingTextView = requireNativeComponent("MBHighlightingTextView");

export default class HighlightingText extends React.Component {
  render() {
		if(Platform.OS === "ios"){
			return( <MBHighlightingTextView {...this.props} /> )
		}
		return( <TextInput {...this.props} /> )
  }
}
