import React from 'react';
import { observer } from 'mobx-react';
import { Text, View, TextInput, TouchableOpacity } from 'react-native';
import App from '../stores/App';

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
					paddingHorizontal: 10,
					paddingVertical: 11,
					width: '100%',
					height: 50,
					backgroundColor: App.theme_input_background_color(),
					flexDirection: "row",
					alignItems: "center"
				}}>
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
						flex: 1,
						backgroundColor: App.theme_button_background_color(), 
						fontSize: 16,
						borderColor: App.theme_border_color(), 
						borderWidth: 1,
						borderRadius: 15,
						paddingHorizontal: 11,
						paddingVertical: 4,
						color: App.theme_text_color()
					}}
					onSubmitEditing={onSubmitEditing}
					onChangeText={onChangeText}
					value={value}
				/>
				<TouchableOpacity
					style={{
						justifyContent: "center",
						alignItems: "center",
						padding: 4,
						marginLeft: 8,
						marginRight: 8,
					}}
					onPress={() => {
						App.toggle_post_search_is_open();
						App.set_posts_query("", null);
					}}
				>
					<Text
						style={{
							color: App.theme_button_text_color()
						}}
					>
						Cancel
					</Text>
				</TouchableOpacity>
			</View>
		);
	}
}
