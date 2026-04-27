import * as React from 'react'
import { observer } from 'mobx-react'
import { View, Text, TouchableOpacity, Platform } from 'react-native'
import Share from '../../stores/Share'
import App from '../../stores/App'
import { SvgXml } from 'react-native-svg'
import { isLiquidGlass } from '../../utils/ui'
import LiquidGlassButton from './liquid_glass_button'

@observer
export default class ShareHeaderComponent extends React.Component {

	renderBackButton() {
		if (isLiquidGlass()) {
			return (
				<LiquidGlassButton
					style={{ width: 44, height: 44 }}
					systemImageName="chevron.left"
					foregroundColor={App.theme_text_color()}
					buttonAccessibilityLabel="Back"
					onPress={Share.close_image_options}
				/>
			)
		}

		return (
			<TouchableOpacity onPress={Share.close_image_options}>
				<SvgXml
					xml={`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="${ App.theme_text_color() }">
							<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
						</svg>`}
					width="24"
					height="24"
				/>
			</TouchableOpacity>
		)
	}

	renderCloseButton() {
		if (isLiquidGlass()) {
			return (
				<LiquidGlassButton
					style={{ width: 44, height: 44 }}
					systemImageName="xmark"
					foregroundColor={App.theme_text_color()}
					buttonAccessibilityLabel="Close"
					onPress={Share.close}
				/>
			)
		}

		return (
			<TouchableOpacity onPress={Share.close}>
				<SvgXml
					xml={`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="${ App.theme_text_color() }" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`}
					width="24"
					height="24"
				/>
			</TouchableOpacity>
		)
	}

	renderActionButton(title, onPress, is_prominent = false) {
		if (isLiquidGlass()) {
			const width = title === 'Save Bookmark' ? 152 : 72
			return (
				<LiquidGlassButton
					style={{ width, height: 36 }}
					title={title}
					variant={is_prominent ? 'prominent' : 'regular'}
					foregroundColor={is_prominent ? '#fff' : App.theme_accent_color()}
					baseBackgroundColor={is_prominent ? App.theme_accent_color() : null}
					buttonAccessibilityLabel={title}
					onPress={onPress}
				/>
			)
		}

		return (
			<TouchableOpacity style={{ marginRight: title === 'Save Bookmark' ? 22 : 0 }} onPress={onPress}>
				<Text style={{ color: App.theme_accent_color(), fontSize: 17, fontWeight: 400 }}>{title}</Text>
			</TouchableOpacity>
		)
	}

	render() {
		const is_liquid_glass = isLiquidGlass()
		const header_base_style = {
			paddingVertical: is_liquid_glass ? 10 : 15,
			paddingHorizontal: 8,
			borderBottomWidth: 1,
			borderBottomColor: App.theme_border_color(),
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between'
		}
		
		let header_ios_style = {}
		if (is_liquid_glass) {
			header_ios_style = {
				marginTop: 3,
				marginLeft: 7,
				marginRight: 7
			}
		}
	
		return (
			<View style={[ header_base_style, Platform.OS == 'ios' && header_ios_style ]}>
				{
					Share.image_options_open ?
					this.renderBackButton()
					:
					this.renderCloseButton()
				}
				{
					!Share.image_options_open &&
					<View style={{ marginRight: is_liquid_glass ? 0 : 5, flexDirection: 'row', alignItems: 'center', gap: is_liquid_glass ? 8 : 0 }}>
						{
							Share.can_save_as_bookmark() &&
							this.renderActionButton('Save Bookmark', Share.save_as_bookmark)
						}
						{this.renderActionButton('Post', Share.send_post, true)}
					</View>
				}
			</View>
		)
	}
}
