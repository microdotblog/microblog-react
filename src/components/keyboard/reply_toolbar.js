import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import App from '../../stores/App';
import { SFSymbol } from 'react-native-sfsymbols'
import { SvgXml } from 'react-native-svg';

@observer
export default class ReplyToolbar extends React.Component{
  
	render() {
    const { posting } = Auth.selected_user
    return(
      <View
				style={{
					width: '100%',
					backgroundColor: App.theme_section_background_color(),
					...Platform.select({
						android: {
							position: 'absolute',
							bottom: 0,
							right: 0,
							left: 0,
						}
					}),
					padding: 5,
					minHeight: 40,
					flexDirection: 'row',
					alignItems: 'center'
				}}
			>
				<TouchableOpacity style={{minWidth: 35}} onPress={() => this.props.reply?.handle_text_action("**")}>
					<Text style={{ fontSize: 18, fontWeight: '700', textAlign: 'center', padding: 2, color: App.theme_text_color() }}>{"b"}</Text>
				</TouchableOpacity>
				<TouchableOpacity style={{minWidth: 35}} onPress={() => this.props.reply?.handle_text_action("_")}>
					<Text style={{ fontSize: 18, fontWeight: '600', fontStyle: "italic", textAlign: 'center', padding: 2, color: App.theme_text_color() }}>{"i"}</Text>
				</TouchableOpacity>
				<TouchableOpacity style={{minWidth: 30, marginLeft: 5}} onPress={() => this.props.reply?.handle_text_action("[]")}>
					{
						Platform.OS === 'ios' ?
							<SFSymbol
								name={'link'}
								color={App.theme_text_color()}
								style={{ height: 20, width: 20 }}
								multicolor={true}
							/>
						: 		
						<SvgXml
							style={{
								height: 18,
								width: 18
							}}
							stroke={App.theme_button_text_color()}
							strokeWidth={2}
							xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
								<path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
							</svg>'
						/>				
					}
				</TouchableOpacity>
				<View
					style={{
						position: 'absolute',
						flexDirection: 'row',
						alignItems: 'center',
						top: posting.reply_chars_offset(),
						right: 8
					}}
				>
					<Text
						style={{
							fontWeight: '400',
							padding: 2,
							color: App.theme_text_color(),
						}}
					><Text style={{ color: this.props.reply?.reply_text_length() > App.max_characters_allowed ? '#a94442' : App.theme_text_color() }}>{this.props.reply?.reply_text_length()}</Text>/{App.max_characters_allowed}</Text>
				</View>
			</View>
    )
  }
  
}