import * as React from 'react'
import { observer } from 'mobx-react'
import { Dimensions, View, Platform } from 'react-native'
import App from '../../stores/App'
import FastImage from 'react-native-fast-image'
import { SvgXml } from 'react-native-svg';
import { SFSymbol } from "react-native-sfsymbols";
import { MenuView } from '@react-native-menu/menu';

@observer
export default class UploadCell extends React.Component {

	render() {
		const { upload } = this.props
		const dimension = (Dimensions.get("screen")?.width / 3) - 10
		return (
			<MenuView
				style={{
					padding: 5,
					backgroundColor: App.theme_background_color_secondary()
				}}
				onPressAction={({ nativeEvent }) => {
					const event_id = nativeEvent.event
					if (event_id === "copy_link") {
						upload.copy_link_to_clipboard()
					}
					else if (event_id === "copy_html") {
						upload.copy_html_to_clipboard()
					}
					else if (event_id === "copy_markdown") {
						upload.copy_markdown_to_clipboard()
					}
					else if (event_id === "open_in_browser") {
						App.open_url(upload.url)
					}
				}}
				actions={[
					{
						title: "Copy Link",
						id: "copy_link",
						image: Platform.select({
							ios: 'link'
						})
					},
					{
						title: "Copy HTML",
						id: "copy_html",
						image: Platform.select({
							ios: 'curlybraces'
						})
					},
					{
						title: "Copy Markdown",
						id: "copy_markdown",
						image: Platform.select({
							ios: 'textformat'
						})
					},
					{
						title: "Open in Browser",
						id: "open_in_browser",
						image: Platform.select({
							ios: 'safari'
						})
					}
				]}
			>
				{
					upload.is_video() ?
						<View style={{position: 'relative'}}> 
							<FastImage
								key={upload.url}
								source={{
									uri: upload.poster,
									priority: FastImage.priority.normal,
									cache: FastImage.cacheControl.web
								}}
								resizeMode={FastImage.resizeMode.cover}
								style={{
									width: dimension,
									height: dimension,
									borderWidth: upload.is_video() || upload.is_audio() ? 2 : 0,
									borderColor: App.theme_placeholder_text_color(),
									borderRadius: 5
								}}
							/>
							{
								Platform.OS === 'ios' ?
									<SFSymbol
										name="film"
										color={App.theme_text_color()}
										size={20}
										multicolor={false}
										style={{ position: 'absolute', right: 20, bottom: 15 }}
									/>
									:
									<SvgXml
										xml={`<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48"><path d="m140 256 74 152h130l-74-152h89l74 152h130l-74-152h89l74 152h130l-74-152h112q24 0 42 18t18 42v520q0 24-18 42t-42 18H140q-24 0-42-18t-18-42V316q0-24 18-42t42-18Zm0 212v368h680V468H140Zm0 0v368-368Z"/></svg>`}
										width={24}
										height={24}
										fill={App.theme_text_color()}
										style={{ position: 'absolute', right: 5, bottom: 5 }}
									/>
							}
						</View>
						:
						upload.is_audio() ?
							<View style={{
								width: dimension,
								height: dimension,
								borderWidth: 2,
								borderColor: App.theme_placeholder_text_color(),
								borderRadius: 5,
								alignItems: 'center',
								justifyContent: 'center'
							}}>
								{
									Platform.OS === 'ios' ?
										<SFSymbol
											name="waveform"
											color={App.theme_text_color()}
											size={20}
											multicolor={false}
										/>
										:
										<SvgXml
											xml={`<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48"><path d="M285 816V336h60v480h-60Zm165 160V176h60v800h-60ZM120 656V496h60v160h-60Zm495 160V336h60v480h-60Zm165-160V496h60v160h-60Z"/></svg>`}
											width={24}
											height={24}
											fill={App.theme_text_color()}
										/>
								}
							</View>
						:
							<FastImage
								key={upload.url}
								source={{
									uri: upload.url,
									priority: FastImage.priority.normal,
									cache: FastImage.cacheControl.web
								}}
								resizeMode={FastImage.resizeMode.cover}
								style={{
									width: dimension,
									height: dimension,
									borderWidth: upload.is_video() || upload.is_audio() ? 2 : 0,
									borderColor: App.theme_placeholder_text_color(),
									borderRadius: 5
								}}
							/>
				}
				
			</MenuView>
		)
	}

}