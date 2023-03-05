import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, Image, Platform, ScrollView } from 'react-native';
import Auth from '../../stores/Auth';
import App from '../../stores/App';
import { SFSymbol } from 'react-native-sfsymbols';

@observer
export default class UsernameToolbar extends React.Component{
  
	render() {
		const { posting } = Auth.selected_user
		if (posting.found_users.length == 0) {
			return null
		}
		else {
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
					<ScrollView keyboardShouldPersistTaps={'always'} horizontal={true} showsHorizontalScrollIndicator={false} style={{overflow: 'hidden'}} contentContainerStyle={{flexDirection: 'row', alignItems: 'center'}}>
						{ posting.found_users.map((u, index) => {
							return (
								<TouchableOpacity style={{marginLeft: 4, marginRight: 8, flexDirection: "row"}} onPress={() => {
									posting.update_autocomplete(u.username)
									console.log("username tapped", u.username);
								}}>
									<Image source={{ uri: u.avatar }} style={{ width: 24, height: 24, borderRadius: 12, marginRight: 3 }} />		
									<Text style={{ fontSize: 15, textAlign: 'center', color: App.theme_text_color() }}>
										@{ u.username }
									</Text>
								</TouchableOpacity>
							)
						}) }
					</ScrollView>
				</View>
			)
		}
	}
	  
}