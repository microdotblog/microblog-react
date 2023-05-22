import * as React from 'react';
import { requireNativeComponent } from 'react-native';

const MBHighlightingTextView = requireNativeComponent("MBHighlightingTextView");

export default class HighlightingText extends React.Component {
  render() {
	return (
	  <MBHighlightingTextView {...this.props} />
	)
  }
}
