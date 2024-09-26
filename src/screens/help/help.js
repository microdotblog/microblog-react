import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import App from '../../stores/App'
import { getVersion, getBuildNumber } from 'react-native-device-info';

@observer
export default class HelpScreen extends React.Component{

	constructor (props) {
		super(props)
		this.team = [
			{ name: "Manton Reece", handle: "manton", "avatar": `https://cdn.micro.blog/manton/avatar.jpg?v=${App.now()}` },
			{ name: "Jonathan Hays", handle: "cheesemaker", "avatar": `https://cdn.micro.blog/cheesemaker/avatar.jpg?v=${App.now()}` },
			{ name: "Vincent Ritter", handle: "vincent", "avatar": `https://cdn.micro.blog/vincent/avatar.jpg?v=${App.now()}` }
		]
	}

	_render_team = () => {
		return this.team.map((member) => {
			return (
				<TouchableOpacity
					key={member.handle}
					style={{
						width: '50%',
						flexDirection: 'row',
						alignItems: 'left',
						padding: 5,
						marginBottom: 15
					}}
					onPress={() => { App.handle_url_from_webview(`https://micro.blog/${ member.handle }`); App.go_back() }}
				>
					<Image source={{ uri: member.avatar }} style={{ width: 36, height: 36, borderRadius: 18, marginBottom: 5 }} />
					<View style={{
						flexDirection: 'column',
						paddingLeft: 7
					}}>
						<Text style={{ color: App.theme_text_color() }}>{member.name}</Text>
						<Text style={{ color: '#337ab7' }}>@{member.handle}</Text>
					</View>
				</TouchableOpacity>
			)
		})

	}
  
  render() {
    return(
			<ScrollView style={{ flex: 1, padding: 15, backgroundColor: App.theme_background_color() }}>
				<View style={{ width: '100%' }}>
					<Text style={{ fontWeight: "500", marginBottom: 15, color: App.theme_text_color() }}>Need help with your blog or another issue on Micro.blog? Email us:</Text>
					<View style={{ alignItems: 'center' }}>
						<TouchableOpacity
							style={{
								padding: 8,
								paddingHorizontal: 15,
								backgroundColor: App.theme_button_background_color(),
								borderRadius: 20,
								borderColor: App.theme_section_background_color(),
								borderWidth: 1
							}}
							onPress={() => App.handle_url_from_webview("mailto:help@micro.blog")}
						>
							<Text style={{ color: App.theme_button_text_color() }}>Email help@micro.blog</Text>
						</TouchableOpacity>
					</View>
				</View>
				<View style={{ marginTop: 25 }}>
					<Text style={{ fontWeight: "500", marginBottom: 15, color: App.theme_text_color() }}>We also have the Help Center, a community discussion forum to get help on a range of Micro.blog topics:</Text>
					<View style={{ alignItems: 'center' }}>
						<TouchableOpacity
							style={{
								padding: 8,
								paddingHorizontal: 15,
								backgroundColor: App.theme_button_background_color(),
								borderRadius: 20,
								borderColor: App.theme_section_background_color(),
								borderWidth: 1
							}}
							onPress={() => App.handle_url_from_webview("https://help.micro.blog")}
						>
							<Text style={{ color: App.theme_button_text_color() }}>Open help.micro.blog</Text>
						</TouchableOpacity>
					</View>
				</View>
				<View style={{ marginTop: 25 }}>
					<Text style={{ fontWeight: "500", marginBottom: 15, color: App.theme_text_color() }}>For a more in-depth look at the principles and technology behind Micro.blog, read the book Indie Microblogging by Manton Reece:</Text>
					<View style={{ alignItems: 'center' }}>
						<TouchableOpacity
							style={{
								padding: 8,
								paddingHorizontal: 15,
								backgroundColor: App.theme_button_background_color(),
								borderRadius: 20,
								borderColor: App.theme_section_background_color(),
								borderWidth: 1
							}}
							onPress={() => App.handle_url_from_webview("https://book.micro.blog")}
						>
							<Text style={{ color: App.theme_button_text_color() }}>Open book.micro.blog</Text>
						</TouchableOpacity>
					</View>
				</View>
				<View style={{ marginTop: 25, paddingTop: 25, borderColor: App.theme_border_color(), borderTopWidth: 1 }}>
					<Text style={{color: App.theme_text_color()}}>Micro.blog is a small team trying to make the web a little better.</Text>
					<View
						style={{
							flexDirection: 'row',
							flexWrap: 'wrap',
							alignItems: 'left',
							justifyContent: 'left',
							marginTop: 15
						}}>
						{this._render_team()}
					</View>
				</View>
				<View style={{ marginTop: 15, paddingTop: 15, borderColor: App.theme_border_color(), borderTopWidth: 1 }}>
					<Text style={{color: App.theme_text_color()}}>Version { getVersion() } (build { getBuildNumber() })</Text>
				</View>
      </ScrollView>
    )
  }
  
}