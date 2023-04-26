import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import FastImage from 'react-native-fast-image';
import App from '../../stores/App'
import Auth from '../../stores/Auth';
import { SvgXml } from 'react-native-svg';

@observer
export default class UserPostingSettings extends React.Component{

	constructor (props) {
		super(props)
		this.state = {
			isOpen: false
		}
	}
	
	render() {
		const { user, index } = this.props
    return(
			<View
				style={{ 
					width: "100%", 
					flexDirection: "column", 
					paddingVertical: 10,
					borderBottomWidth: Auth.users.length - 1 !== index ? 1 : 0, 
					borderColor: App.theme_border_color()
				}}
			>
				<View
					style={{
						flexDirection: "row",
						justifyContent: "space-between", 
						alignItems: "center", 
					}}
				>
					<View style={{flexDirection: "row", alignItems: "center"}}>
						<FastImage
							source={{
								uri: `${user.avatar}?v=${App.now()}`,
								priority: FastImage.priority.normal,
								cache: FastImage.cacheControl.web
							}}
							resizeMode={FastImage.resizeMode.contain}
							style={{ width: 24, height: 24, borderRadius: 50, marginRight: 8 }}
						/>
					</View>
					<TouchableOpacity onPress={() => this.setState({isOpen: !this.state.isOpen})} style={{flexDirection: "row", alignItems: "center"}}>
						<Text style={{ color: App.theme_text_color() }}>{user.posting?.selected_service?.description()}</Text>
						<SvgXml
							xml={`
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="${App.theme_text_color()}" viewBox="0 0 24 24">
									<path d="M7 10l5 5 5-5z"/>
									<path d="M0 0h24v24H0z" fill="none"/>
								</svg>
							`} 
						/>
					</TouchableOpacity>
				</View>
				{
					this.state.isOpen &&
						<View style={{ flexDirection: "column", marginTop: 12 }}>
							<TouchableOpacity style={{flexDirection: "row", alignItems: "center", marginBottom: 8}}>
								<View
									style={{
										width: 8,
										height: 8,
										backgroundColor: user.posting?.selected_service?.is_microblog ? App.theme_accent_color() : App.theme_text_color(),
										borderRadius: 50,
										marginRight: 8
								}} />
								<Text style={{ color: App.theme_text_color(), fontSize: 16, fontWeight: user.posting?.selected_service?.is_microblog ? "500" : "300" }}>Micro.blog hosted weblog</Text>
							</TouchableOpacity>
							<View style={{ flexDirection: "column" }}>
								<TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }}>
									<View
										style={{
											width: 8,
											height: 8,
											backgroundColor: !user.posting?.selected_service?.is_microblog ? App.theme_accent_color() : App.theme_text_color(),
											borderRadius: 50,
											marginRight: 8
									}} />
									<Text style={{ color: App.theme_text_color(), fontSize: 16, fontWeight: user.posting?.selected_service?.is_microblog ? "500" : "300" }}>WordPress or compatible weblog</Text>
								</TouchableOpacity>
								<View style={{ flexDirection: "column", marginTop: 12 }}>
									<TextInput
										style={{
											backgroundColor: App.theme_input_contrast_alt_background_color(),
											padding: 12,
											borderRadius: 8,
											color: App.theme_text_color(),
											fontSize: 16,
											fontWeight: "300"
										}}
										placeholder="Enter your blog URL"
										placeholderTextColor={App.theme_placeholder_text_color()}
										keyboardType="url"
										autoCapitalize="none"
										autoCorrect={false}
										returnKeyType="go"
									/>
								</View>
							</View>
						</View>
				}
			</View>
    )
  }
  
}