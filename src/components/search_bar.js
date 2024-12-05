import React from 'react';
import { observer } from 'mobx-react';
import { Text, View, TextInput, TouchableOpacity } from 'react-native';
import App from '../stores/App';
import { SFSymbol } from "react-native-sfsymbols";
import { SvgXml } from 'react-native-svg';

@observer
export default class SearchBar extends React.Component {
	render() {
		const {
			placeholder,
			onSubmitEditing,
			onChangeText,
			value			
		} = this.props;
		
		return (
	    	<View
				style={{
					paddingHorizontal: 8,
					paddingVertical: 11,
					width: '100%',
					height: 50,
					backgroundColor: App.theme_input_background_color(),
					flexDirection: "row",
					alignItems: "center"
				}}>
				<TouchableOpacity
					style={{
						justifyContent: "center",
						alignItems: "center",
						backgroundColor: App.theme_header_button_background_color(),
						borderColor: App.theme_border_color(),
						borderWidth: 1,
						padding: 4,
						borderRadius: 50,
						marginRight: 8,
						width: 28,
						height: 28
					}}
					onPress={() => {
						App.toggle_post_search_is_open();
						App.set_posts_query("", null);
					}}
				>
				{
					Platform.OS === "ios" ?
						<SFSymbol
							name={"xmark"}
							color={App.theme_button_text_color()}
							style={{ height: 12, width: 12 }}
						/>
						:
						<SvgXml
							style={{
								height: 12,
								width: 12
							}}
							stroke={App.theme_button_text_color()}
							strokeWidth={2}
							xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>'
						/>
				}
				</TouchableOpacity>
				<TextInput
					placeholderTextColor="lightgrey"
					placeholder={placeholder}
					returnKeyType={'search'}
					blurOnSubmit={true}
					autoFocus={true}
					autoCorrect={true}
					autoCapitalize="none"
					clearButtonMode={'while-editing'}
					enablesReturnKeyAutomatically={true}
					underlineColorAndroid={'transparent'}
					style={{ 
						backgroundColor: App.theme_button_background_color(), 
						fontSize: 16,
						borderColor: App.theme_border_color(), 
						borderWidth: 1,
						borderRadius: 15,
						paddingHorizontal: 10,
						paddingVertical: 4,
						minWidth: "85%",
						color: App.theme_text_color()
					}}
					onSubmitEditing={onSubmitEditing}
					onChangeText={onChangeText}
					value={value}
				/>
			</View>
		);
	}
}
