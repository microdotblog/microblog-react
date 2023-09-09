import { observer } from 'mobx-react'
import * as React from 'react'
import { Image, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SFSymbol } from 'react-native-sfsymbols'
import PhotoLibrary from '../../assets/icons/toolbar/photo_library.png'
import SettingsIcon from '../../assets/icons/toolbar/settings.png'
import { postingOptionsScreen, postOptionsSettingsScreen } from '../../screens'
import App from '../../stores/App'
import Auth from '../../stores/Auth'
import Share from '../../stores/Share'

@observer
export default class PostToolbar extends React.Component{

	_render_users_select() {
		if (App.is_share_extension && Share.users.length > 1 && Share.toolbar_select_user_open) {
			return (
				<View style={{ backgroundColor: App.theme_section_background_color(), padding: 5 }}>
					<ScrollView keyboardShouldPersistTaps={'always'} horizontal={true} style={{ overflow: 'hidden', maxWidth: "100%" }} contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}>
						{
							Share.sorted_users().map((user, index) => {
								const is_selected_user = Share.selected_user?.username == user.username
								return (
									<TouchableOpacity key={index} onPress={() => Share.select_user(user)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 5, borderRadius: 5, backgroundColor: is_selected_user ? App.theme_selected_button_color() : App.theme_section_background_color(), marginRight: 5 }}>
										<Image source={{ uri: user.avatar }} style={{ width: 20, height: 20, borderRadius: 10, marginRight: 5 }} />
										<Text style={{ color: App.theme_text_color(), fontWeight: is_selected_user ? 600 : 300 }}>{user.username}</Text>
									</TouchableOpacity>
								)
							})
						}
					</ScrollView>
				</View>
			)
		}
		return false
	}

	_render_destinations() {
		const { posting } = App.is_share_extension ? Share.selected_user : Auth.selected_user
		if (posting?.selected_service?.config?.active_destination() != null && posting?.selected_service?.config?.destination?.length > 1 && App.toolbar_select_destination_open) {
			return (
				<View style={{ backgroundColor: App.theme_section_background_color(), padding: 5 }}>
					<ScrollView keyboardShouldPersistTaps={'always'} horizontal={true} style={{ overflow: 'hidden', maxWidth: "100%" }} contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}>
						{
							posting.selected_service?.config?.sorted_destinations().map((destination, index) => {
								const is_selected_destination = posting.selected_service?.config?.active_destination()?.uid == destination.uid
								return (
									<TouchableOpacity key={index} onPress={() => { posting.selected_service?.config?.set_default_destination(destination); posting.reset_post_syndicates(); App.toggle_select_destination() }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 5, borderRadius: 5, backgroundColor: is_selected_destination ? App.theme_selected_button_color() : App.theme_section_background_color(), marginRight: 5 }}>
										<Text style={{ color: App.theme_text_color(), fontWeight: is_selected_destination ? 600 : 300 }}>{destination.name}</Text>
									</TouchableOpacity>
								)
							})
						}
					</ScrollView>
				</View>
			)
		}
		return null
	}
  
	render() {
		const { posting } = App.is_share_extension ? Share.selected_user : Auth.selected_user
		return (
			<View
				style={{
					width: '100%',
					...Platform.select({
						android: {
							position: 'absolute',
							bottom: 0,
							right: 0,
							left: 0,
						}
					})
				}}
			>
				{this._render_destinations()}
				{this._render_users_select()}
				<View
					style={{
						width: '100%',
						backgroundColor: App.theme_section_background_color(),
						padding: 5,
						minHeight: 40,
						flexDirection: 'row',
						alignItems: 'center'
					}}
				>
					<ScrollView keyboardShouldPersistTaps={'always'} horizontal={true} style={{ overflow: 'hidden', maxWidth: App.is_share_extension ? "85%" : "90%" }} contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}>
						{
							App.is_share_extension && Share.selected_user != null &&
							<TouchableOpacity onPress={Share.toggle_select_user} style={{marginRight: 4}}>
								<Image source={{ uri: Share.selected_user?.avatar }} style={{ width: 24, height: 24, borderRadius: 50 }} />
							</TouchableOpacity>
						}
						{
							!this.props.is_post_edit && !App.is_share_extension &&
							<>
								<TouchableOpacity style={{minWidth: 35, marginLeft: 4, marginRight: 0}} onPress={() => posting.handle_asset_action(this.props.componentId)}>
								{
									Platform.OS === 'ios' ?
										<SFSymbol
											name={'photo'}
											color={App.theme_text_color()}
											style={{ height: 22, width: 22 }}
											multicolor={true}
										/>
									: 						
									<Image source={PhotoLibrary} style={{width: 24, height: 24, tintColor: App.theme_text_color()}} />
								}
								</TouchableOpacity>
							</>
						}
						<TouchableOpacity style={{minWidth: 35}} onPress={() => App.is_share_extension ? Share.handle_text_action("**") : posting.handle_text_action("**")}>
							<Text style={{ fontSize: 18, fontWeight: '600', textAlign: 'center', padding: 2, color: App.theme_text_color() }}>{"**"}</Text>
						</TouchableOpacity>
						<TouchableOpacity style={{minWidth: 35}} onPress={() => App.is_share_extension ? Share.handle_text_action("_") : posting.handle_text_action("_")}>
							<Text style={{ fontSize: 18, fontWeight: '600', textAlign: 'center', padding: 2, color: App.theme_text_color() }}>{"_"}</Text>
						</TouchableOpacity>
						<TouchableOpacity style={{minWidth: 35}} onPress={() => App.is_share_extension ? Share.handle_text_action("[]") : posting.handle_text_action("[]")}>
							<Text style={{ fontSize: 18, fontWeight: '600', textAlign: 'center', padding: 2, color: App.theme_text_color() }}>{"[ ]"}</Text>
						</TouchableOpacity>
						{/* <TouchableOpacity style={{minWidth: 35}} onPress={() => posting.toggle_title()}>
							<Text style={{ fontSize: 18, fontWeight: '600', textAlign: 'center', padding: 2, color: App.theme_text_color() }}>{"T"}</Text>
						</TouchableOpacity> */}
						{
							!this.props.is_post_edit && posting.selected_service?.config?.active_destination() != null && (posting.selected_service?.config?.destination?.length > 1 || (!posting.selected_service?.is_microblog && !App.is_share_extension)) ?
							<TouchableOpacity style={{marginLeft: 8, marginRight: 8}} onPress={() => {!posting.selected_service?.is_microblog ? postOptionsSettingsScreen(App.is_share_extension ? Share.selected_user : Auth.selected_user, this.props.componentId) : App.toggle_select_destination()}}>
								<Text style={{ fontSize: 16, fontWeight: '500', textAlign: 'center', color: App.theme_text_color() }}>
									{posting.selected_service.config.active_destination().name}
								</Text>
							</TouchableOpacity>
							: 
							!this.props.is_post_edit && posting.selected_service?.config?.active_destination() == null && !posting.selected_service?.is_microblog && !App.is_share_extension ?
							<TouchableOpacity style={{marginLeft: 8, marginRight: 8}} onPress={() => {!posting.selected_service?.is_microblog ? postOptionsSettingsScreen(App.is_share_extension ? Share.selected_user : Auth.selected_user, this.props.componentId) : App.toggle_select_destination()}}>
								<Text style={{ fontSize: 16, fontWeight: '500', textAlign: 'center', color: App.theme_text_color() }}>
									{posting.selected_service?.name}
								</Text>
							</TouchableOpacity>
							: null
						}
					</ScrollView>
					<View
						style={{
							position: 'absolute',
							right: App.is_share_extension ? 2 : 8,
							bottom: App.is_share_extension ? -4 : 9,
							flexDirection: 'row',
							alignItems: 'center',
							backgroundColor: App.theme_section_background_color(),
						}}
					>
						{
							!this.props.is_post_edit && !App.is_share_extension &&
							<TouchableOpacity
								onPress={() => postingOptionsScreen(this.props.componentId)}
							>
							{
								Platform.OS === 'ios' ?
									<SFSymbol
										name={'gearshape'}
										color={App.theme_text_color()}
										style={{ height: 22, width: 22 }}
										multicolor={true}
									/>
								: 						
								<Image source={SettingsIcon} style={{width: 24, height: 24, tintColor: App.theme_text_color()}} />
							}
							</TouchableOpacity>
						}
						{
							!posting.post_title && !this.props.hide_count && ((!App.toolbar_select_destination_open && !App.is_share_extension ) || App.is_share_extension) &&
							<Text
								style={{
									fontWeight: '400',
									padding: 2,
									color: App.theme_text_color(),
									position: 'absolute',
									top: posting.post_chars_offset(this.props.is_post_edit),
									right: 0,
									backgroundColor: posting.post_assets.length > 5 ? App.theme_background_color() : null,
									opacity: posting.post_assets.length > 5 ? .7 : 1
								}}
							><Text style={{ color: posting.post_text_length() > posting.max_post_length() ? '#a94442' : App.theme_text_color() }}>{posting.post_text_length()}</Text>/{posting.max_post_length()}</Text>
						}
					</View>
				</View>
			</View>
    )
  }
  
}