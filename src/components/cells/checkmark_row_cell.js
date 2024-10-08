import * as React from 'react'
import { View, Text } from 'react-native'
import App from '../../stores/App'
import { SvgXml } from 'react-native-svg';
import { SFSymbol } from "react-native-sfsymbols";

export default class CheckmarkRowCell extends React.Component {

	constructor (props) {
		super(props);
		this.state = {
			text: props.text,
			is_selected: props.is_selected
		};
	}

	render() {		
		const { text, is_selected } = this.props;
		
		const { upload } = this.props;
		return (
			<View style={{ flexDirection: "row", minHeight: 20, alignItems: "center" }}>
				<Text style={{ color: App.theme_button_text_color(), paddingRight: 5 }}>{text}</Text>
				{ is_selected && <SFSymbol name={"checkmark.circle.fill"} color={App.theme_button_text_color()} style={{ height: 18, width: 18 }} /> }
			</View>
		);
	}

}