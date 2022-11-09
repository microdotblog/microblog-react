import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Discover from '../../stores/Discover'
import { tagmojiBottomSheet } from '../../screens'
import App from '../../stores/App'

@observer
export default class TagmojiMenu extends React.Component{

	_return_tagmoji_menu() {
		return (
			<View
				style={{
					flexDirection: 'row',
					flexWrap: 'wrap',
					padding: 16,
					marginBottom: 20
				}}
			>
				{
					Discover.tagmoji.map((tagmoji, index) => {
						return (
							<TouchableOpacity
								key={index}
								style={{
									flexDirection: 'row',
									alignItems: 'center',
									width: '45%',
									padding: 8,
								}}
								onPress={() => { tagmojiBottomSheet(true); App.navigate_to_screen("discover/topic", tagmoji) }}
							>
								<Text style={{ marginRight: 5, fontSize: 17 }}>{tagmoji.emoji}</Text>
								<Text style={{ fontSize: 17, color: App.theme_text_color() }}>{tagmoji.name}</Text>
							</TouchableOpacity>
						)
					}
					)
				}
			</View>
		)
	}
  
  render() {
    return this._return_tagmoji_menu()
  }
  
}