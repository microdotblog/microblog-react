import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Navigation } from 'react-native-navigation';
import App from '../../stores/App'
import { getVersion } from 'react-native-device-info';

@observer
export default class HelpScreen extends React.Component{

	constructor (props) {
		super(props)
		Navigation.events().bindComponent(this)
		let now = new Date()
		now.setHours(0,0,0,0)
		this.now = now
		this.team = [
			{ name: "Manton Reece", handle: "manton", "avatar": `https://micro.blog/manton/avatar.jpg?v=${this.now}` },
			{ name: "Jean MacDonald", handle: "jean", "avatar": `https://micro.blog/jean/avatar.jpg?v=${this.now}` },
			{ name: "Jonathan Hays", handle: "cheesemaker", "avatar": `https://micro.blog/cheesemaker/avatar.jpg?v=${this.now}` },
			{ name: "Vincent Ritter", handle: "vincent", "avatar": `https://micro.blog/vincent/avatar.jpg?v=${this.now}` }
		]
	}
	
	navigationButtonPressed = async ({ buttonId }) => {
    if(buttonId === "back_button"){
      this._dismiss()
    }
	}
	
	_dismiss = () => {
		Navigation.dismissModal(this.props.componentId)
	}

	_render_team = () => {
		return this.team.map((member) => {
			return (
				<TouchableOpacity
					key={member.handle}
					style={{
						justifyContent: 'center',
						alignItems: 'center',
						padding: 5,
						marginBottom: 15
					}}
					onPress={() => App.handle_url_from_webview(`https://micro.blog/${member.handle}`)}
				>
					<Image source={{ uri: member.avatar }} style={{ width: 60, height: 60, borderRadius: 50, marginBottom: 5 }} />
					<Text>{member.name}</Text>
					<Text style={{ color: '#337ab7' }}>@{member.handle}</Text>
				</TouchableOpacity>
			)
		})

	}
  
  render() {
    return(
			<ScrollView style={{ flex: 1, padding: 15 }}>
				<View style={{ width: '100%' }}>
					<Text style={{ fontWeight: "500", marginBottom: 15 }}>Need help with your blog or another issue on Micro.blog? Email us:</Text>
					<View style={{ alignItems: 'center' }}>
						<TouchableOpacity
							style={{
								padding: 8,
								paddingHorizontal: 15,
								backgroundColor: '#F9FAFB',
								borderRadius: 5
							}}
							onPress={() => App.handle_url_from_webview("mailto:help@micro.blog")}
						>
							<Text style={{ color: '#337ab7' }}>Email help@micro.blog</Text>
						</TouchableOpacity>
					</View>
				</View>
				<View style={{ marginTop: 25 }}>
					<Text style={{ fontWeight: "500", marginBottom: 15 }}>We also have the Help Center, a community discussion forum to get help on a range of Micro.blog topics:</Text>
					<View style={{ alignItems: 'center' }}>
						<TouchableOpacity
							style={{
								padding: 8,
								paddingHorizontal: 15,
								backgroundColor: '#F9FAFB',
								borderRadius: 5
							}}
							onPress={() => App.handle_url_from_webview("https://help.micro.blog")}
						>
							<Text style={{ color: '#337ab7' }}>Open help.micro.blog</Text>
						</TouchableOpacity>
					</View>
				</View>
				<View style={{ marginTop: 45, paddingTop: 15, borderColor: '#E5E7EB', borderTopWidth: 1 }}>
					<Text>Micro.blog is a small team trying to make the web a little better.</Text>
					<View
						style={{
							flexDirection: 'row',
							flexWrap: 'wrap',
							justifyContent: 'space-around',
							alignItems: 'center',
							marginTop: 15
						}}>
						{this._render_team()}
					</View>
				</View>
				<View style={{ marginTop: 15, paddingTop: 15, borderColor: '#E5E7EB', borderTopWidth: 1 }}>
					<Text>Version { getVersion() }</Text>
				</View>
      </ScrollView>
    )
  }
  
}