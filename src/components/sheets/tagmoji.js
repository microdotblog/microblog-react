import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity } from 'react-native';
import Discover from '../../stores/Discover'

@observer
export default class TagmojiMenu extends React.Component{

	_return_tagmoji_menu() {
		return (
			<View
				style={{
					flexDirection: 'row',
					flexWrap: 'wrap',
					paddingBottom: 35
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
									padding: 5,
								}}
							>
								<Text style={{ marginRight: 5 }}>{tagmoji.emoji}</Text>
								<Text>{tagmoji.name}</Text>
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
      <View
        style={{
          padding: 15,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 16
        }}
      >
				<Text style={{ fontWeight: '800', marginBottom: 15 }}>Topics</Text>
				{this._return_tagmoji_menu()}
      </View>
    )
  }
  
}