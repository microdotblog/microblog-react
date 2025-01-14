import * as React from 'react';
import { observer } from 'mobx-react';
import { TouchableOpacity, Platform } from 'react-native';
import Auth from './../../stores/Auth';
import App from '../../stores/App'
import { SFSymbol } from "react-native-sfsymbols";
import { SvgXml } from 'react-native-svg';

@observer
export default class NewCollectionButton extends React.Component{
  
	render() {
		return (
			<TouchableOpacity 
				style={{ 
					height: 22,
					justifyContent: 'center',
					alignItems: 'center'
				}}
				onPress={() => {
					App.navigate_to_screen("AddCollection");
				}}
			>
			{ Platform.OS === 'ios' ? 
				<SFSymbol
					name="plus"
					color={App.theme_text_color()}
					style={{ width: 22, height: 22 }}
				/>
			:
				<SvgXml
					style={{
						height: 28,
						width: 28
					}}
					color={App.theme_text_color()}
					xml='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>'
				/>
			}
			
			</TouchableOpacity>
		)
	}
  
}