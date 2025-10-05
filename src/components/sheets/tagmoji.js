import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import ActionSheet from "react-native-actions-sheet";
import Discover from '../../stores/Discover'
import App from '../../stores/App'
import SheetHeader from "./header";

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
								onPress={() => { App.close_sheet("tagmoji_menu"); App.navigate_to_screen("discover/topic", tagmoji) }}
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
    return(
			<ActionSheet
				id={this.props.sheetId}
				snapPoints={[40,95]}
				initialSnapIndex={[0]}
				overdrawEnabled={true}
				useBottomSafeAreaPadding={true}
				gestureEnabled={true}
				containerStyle={{
					backgroundColor: App.theme_background_color_secondary()
				}}
			>
			<SheetHeader title="Topics" />
			<ScrollView style={{maxHeight: 700, marginBottom: 15}} {...this.scrollHandlers}>
			{this._return_tagmoji_menu()}
			</ScrollView>
			</ActionSheet>
		)
  }
  
}
