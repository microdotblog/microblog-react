import * as React from 'react'
import { View, Text, Platform } from 'react-native'
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
		return (
			<View style={{ flexDirection: "row", minHeight: 20, alignItems: "center" }}>
				<Text style={{ color: App.theme_button_text_color(), paddingRight: 5 }}>{text}</Text>
				{ 
				  is_selected && Platform.OS === 'ios' ? 
						<SFSymbol name={"checkmark.circle.fill"} color={App.theme_button_text_color()} style={{ height: 18, width: 18 }} />
					: is_selected ?
					<SvgXml
					  color={App.theme_button_text_color()}
						style={{ height: 18, width: 18 }}
					  xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>'
          />
					: null
				}
			</View>
		);
	}

}
