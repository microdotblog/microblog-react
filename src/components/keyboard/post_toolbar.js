import { observer } from 'mobx-react'
import * as React from 'react'
import { Image, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SFSymbol } from 'react-native-sfsymbols'
import PhotoLibrary from '../../assets/icons/toolbar/photo_library.png'
import SettingsIcon from '../../assets/icons/toolbar/settings.png'
import App from '../../stores/App'
import Auth from '../../stores/Auth'
import Share from '../../stores/Share'
import { SvgXml } from 'react-native-svg';
import CheckmarkRowCell from '../cells/checkmark_row_cell'

@observer
export default class PostToolbar extends React.Component{

	_render_users_select() {
		const { users } = Platform.OS === "ios" ? Share : Auth
		if (App.is_share_extension && users?.length > 1 && Share.toolbar_select_user_open) {
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
		const { posting } = this.props.posting != null ? this.props : Auth.selected_user
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
	
	_render_categories() {
	  const { posting } = this.props.posting != null ? this.props : Auth.selected_user
		if(App.is_share_extension && posting.selected_service.config?.active_destination()?.categories.length && App.toolbar_categories_open){
		  return(
				<View style={{ backgroundColor: App.theme_section_background_color(), padding: 5 }}>
					<ScrollView keyboardShouldPersistTaps={'always'} horizontal={true} style={{ overflow: 'hidden', maxWidth: "100%" }} contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}>
					{
  					posting.selected_service.config.active_destination().categories.map((category) => {
  						const is_selected = posting.post_categories.indexOf(category) > -1
  						return(
  							<TouchableOpacity
  								key={category}
  								style={{
  									padding: 4,
  									marginHorizontal: 2.5,
  									flexDirection: 'row',
  									alignItems: 'center',
  								}}
  								onPress={() => {
  									posting.handle_post_category_select(category)
  								}}
  							>
  								<CheckmarkRowCell text={category} is_selected={is_selected} />
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
		const { posting } = this.props.posting != null ? this.props : Auth.selected_user
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
				{this._render_categories()}
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
								<TouchableOpacity
									style={{minWidth: 30, marginLeft: 4, marginRight: 0}}
									onPress={() => posting.handle_asset_action(this.props.componentId)}
									accessibilityRole="button"
									accessibilityLabel="Add photo"
								>
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
						{
							!this.props.is_post_edit && !App.is_share_extension && (Auth.selected_user?.is_premium != null && Auth.selected_user?.is_premium) &&
							<>
								<TouchableOpacity
									style={{minWidth: 30, marginLeft: 4, marginRight: 0}}
									onPress={() => App.navigate_to_screen("PostUploads")}
									accessibilityRole="button"
									accessibilityLabel="Add file"
								>
								{
									Platform.OS === 'ios' ?
										<SFSymbol
											name={'speaker.wave.2.fill'}
											color={App.theme_text_color()}
											style={{ height: 22, width: 22 }}
											multicolor={true}
										/>
									: 						
									<SvgXml
										style={{
											height: 20,
											width: 20
										}}
										stroke={App.theme_button_text_color()}
										fill={App.theme_button_text_color()}
										strokeWidth={.5}
										xml='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
											<path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
											<path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
										</svg>'
									/>
								}
								</TouchableOpacity>
							</>
						}
						<TouchableOpacity style={{minWidth: 30, marginLeft: 4}} onPress={() => App.is_share_extension ? Share.handle_text_action("**") : posting.handle_text_action("**")}>
							{ Platform.OS === 'ios' ?
								<SFSymbol name={'bold'} color={App.theme_text_color()} style={{ height: 18, width: 18 }} />
								:
								<SvgXml style={{ height: 18, width: 18 }} color={App.theme_text_color()} xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linejoin="round" d="M6.75 3.744h-.753v8.25h7.125a4.125 4.125 0 0 0 0-8.25H6.75Zm0 0v.38m0 16.122h6.747a4.5 4.5 0 0 0 0-9.001h-7.5v9h.753Zm0 0v-.37m0-15.751h6a3.75 3.75 0 1 1 0 7.5h-6m0-7.5v7.5m0 0v8.25m0-8.25h6.375a4.125 4.125 0 0 1 0 8.25H6.75m.747-15.38h4.875a3.375 3.375 0 0 1 0 6.75H7.497v-6.75Zm0 7.5h5.25a3.75 3.75 0 0 1 0 7.5h-5.25v-7.5Z" /></svg>' />
							}
						</TouchableOpacity>
						<TouchableOpacity style={{minWidth: 30}} onPress={() => App.is_share_extension ? Share.handle_text_action("_") : posting.handle_text_action("_")}>
							{ Platform.OS === 'ios' ?
								<SFSymbol name={'italic'} color={App.theme_text_color()} style={{ height: 18, width: 18 }} />
								:
								<SvgXml style={{ height: 18, width: 18 }} color={App.theme_text_color()} xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M5.248 20.246H9.05m0 0h3.696m-3.696 0 5.893-16.502m0 0h-3.697m3.697 0h3.803" /></svg>' />
							}
						</TouchableOpacity>
						<TouchableOpacity
							style={{minWidth: 30, marginLeft: 5}}
							onPress={() => App.is_share_extension ? Share.handle_text_action("[]") : posting.handle_text_action("[]")}
							accessibilityRole="button"
							accessibilityLabel="Link"
						>
							{
								Platform.OS === 'ios' ?
									<SFSymbol
										name={'link'}
										color={App.theme_text_color()}
										style={{ height: 20, width: 20 }}
										multicolor={true}
									/>
								: 		
								<SvgXml
									style={{
										height: 18,
										width: 18
									}}
									stroke={App.theme_button_text_color()}
									strokeWidth={2}
									xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
										<path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
									</svg>'
								/>
							}
						</TouchableOpacity>
						{
						  App.is_share_extension && posting.selected_service.config?.active_destination()?.categories.length ?
								<TouchableOpacity style={{minWidth: 30, marginLeft: 4, marginRight: 0}} onPress={() => App.toggle_category_select()}>
								{
									Platform.OS === 'ios' ?
										<SFSymbol
											name={'tag'}
											color={App.theme_text_color()}
											style={{ height: 22, width: 22 }}
											multicolor={true}
										/>
									: 						
									<SvgXml
										style={{
											height: 18,
											width: 18
										}}
										stroke={App.theme_button_text_color()}
										strokeWidth={2}
										xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" />
                    </svg>'
									/>
								}
								</TouchableOpacity>
							 : null
						}
						{
							!this.props.is_post_edit && posting.selected_service?.config?.active_destination() != null && (posting.selected_service?.config?.destination?.length > 1 || (!posting.selected_service?.is_microblog && !App.is_share_extension)) ?
							<TouchableOpacity style={{marginLeft: 8, marginRight: 8}} onPress={() => {!posting.selected_service?.is_microblog ? App.navigate_to_screen("post_service", App.is_share_extension ? Share.selected_user : Auth.selected_user) : App.toggle_select_destination()}}>
								<Text style={{ fontSize: 16, fontWeight: '500', textAlign: 'center', color: App.theme_text_color() }}>
									{posting.selected_service.config.active_destination().name}
								</Text>
							</TouchableOpacity>
							: 
							!this.props.is_post_edit && posting.selected_service?.config?.active_destination() == null && !posting.selected_service?.is_microblog && !App.is_share_extension ?
							<TouchableOpacity style={{marginLeft: 8, marginRight: 8}} onPress={() => {!posting.selected_service?.is_microblog ? App.navigate_to_screen("post_service", App.is_share_extension ? Share.selected_user : Auth.selected_user) : App.toggle_select_destination()}}>
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
							!App.is_share_extension &&
							<TouchableOpacity
								onPress={() => App.navigate_to_screen(this.props.is_post_edit ? "PostEditOptions" : "PostingOptions")}
								accessibilityRole="button"
								accessibilityLabel="Post options"
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
