import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity } from 'react-native';
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
					<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
						<Text>Inputs here...</Text>
					</View>
				}
			</View>
    )
  }
  
}