import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import Auth from '../../stores/Auth';
import CheckmarkIcon from '../../assets/icons/checkmark.png';
import App from '../../stores/App'

@observer
export default class PostingOptionsScreen extends React.Component{

	componentDidMount() {
    if (Auth.selected_user.posting.selected_service != null) {
      Auth.selected_user.posting.selected_service.check_for_categories()
    }
  }
  
  render() {
    const { posting } = Auth.selected_user
    return(
			<ScrollView style={{ flex: 1, padding: 15 }}>
				{/* Post status */}
				<View style={{ marginBottom: 25 }}>
					<Text style={{ fontSize: 16, fontWeight: '500', color: App.theme_text_color() }}>
						{ posting.selected_service?.type === "microblog" ? "When sending this post to Micro.blog" : "When sending this post to your blog" }:
					</Text>
					<View style={{ backgroundColor: App.theme_button_background_color(), padding: 8, borderRadius: 8, marginTop: 8 }}>
						<TouchableOpacity
							key={"published"}
							style={{ padding: 8, marginVertical: 2.5, flexDirection: 'row', alignItems: 'center' }}
							onPress={() => {	
								posting.handle_post_status_select("published")
							}}
						>
							<Text style={ posting.post_status == "published" ? { fontWeight: '500', color: App.theme_button_text_color() } : { color: App.theme_button_text_color() }}>Publish to your blog { posting.post_status == "published" ? <Image source={CheckmarkIcon} style={{ width: 12, height: 12, tintColor: App.theme_button_text_color() }} /> : null }</Text>
						</TouchableOpacity>
						<TouchableOpacity
							key={"draft"}
							style={{ padding: 8, marginBottom: 5, flexDirection: 'row', alignItems: 'center' }}
							onPress={() => {						
								posting.handle_post_status_select("draft")
							}}
						>
							<Text style={ posting.post_status == "draft" ? { fontWeight: '500', color: App.theme_button_text_color() } : { color: App.theme_button_text_color() }}>Save as a draft { posting.post_status == "draft" ? <Image source={CheckmarkIcon} style={{ width: 12, height: 12, tintColor: App.theme_button_text_color() }} /> : null }</Text>
						</TouchableOpacity>
					</View>
				</View>
				{/* Categories */}
				<View style={{ marginBottom: 25 }}>
					<Text style={{ fontSize: 16, fontWeight: '500', color: App.theme_text_color() }}>Select categories for this post:</Text>
					<View style={{ backgroundColor: App.theme_button_background_color(), padding: 8, borderRadius: 8, marginTop: 8 }}>
					{
						posting.selected_service.config?.active_destination()?.categories.length ?
							posting.selected_service.config.active_destination().categories.map((category) => {
								const is_selected = posting.post_categories.indexOf(category) > -1
								return(
									<TouchableOpacity
										key={category}
										style={{
											padding: 8,
											marginVertical: 2.5,
											flexDirection: 'row',
											alignItems: 'center',
										}}
										onPress={() => {
											posting.handle_post_category_select(category)
										}}
									>
										<Text style={ is_selected ? { fontWeight: '500', color: App.theme_button_text_color() } : { color: App.theme_button_text_color() }}>{category} { is_selected ? <Image source={CheckmarkIcon} style={{ width: 12, height: 12, tintColor: App.theme_button_text_color() }} /> : null }</Text>
									</TouchableOpacity>
								)
							})
						: <Text style={{ color: App.theme_button_text_color() }}>No categories to display</Text>
					}
					</View>
				</View>
				{/* Cross posting */}
				<View style={{ marginBottom: 25 }}>
					<Text style={{ fontSize: 16, fontWeight: '500', color: App.theme_text_color() }}>Cross-posting:</Text>
					<View style={{ backgroundColor: App.theme_button_background_color(), padding: 8, borderRadius: 8, marginTop: 8 }}>
					{
						posting.selected_service.active_destination()?.syndicates?.length ?
							posting.selected_service.active_destination().syndicates.map((syndicate) => {
								const is_selected = posting.post_syndicates.indexOf(syndicate.uid) > -1
								return(
									<TouchableOpacity
										key={syndicate.uid}
										style={{
											padding: 8,
											marginVertical: 2.5,
											flexDirection: 'row',
											alignItems: 'center',
										}}
										onPress={() => {
											posting.handle_post_syndicates_select(syndicate.uid)
										}}
									>
										<Text style={ is_selected ? { fontWeight: '500', color: App.theme_button_text_color() } : { color: App.theme_button_text_color() }}>{syndicate.name} { is_selected ? <Image source={CheckmarkIcon} style={{ width: 12, height: 12, tintColor: App.theme_button_text_color() }} /> : null }</Text>
									</TouchableOpacity>
								)
							})
						: <Text style={{ color: App.theme_button_text_color() }}>No cross-posting options to display</Text>
					}
					</View>
				</View>
				{/* Other options */}
				<View style={{ marginBottom: 25 }}>
					<Text style={{ fontSize: 16, fontWeight: '500', color: App.theme_text_color() }}>View:</Text>
					<View style={{ backgroundColor: App.theme_button_background_color(), padding: 8, borderRadius: 8, marginTop: 8 }}>
						<TouchableOpacity
							style={{
								padding: 8,
								marginVertical: 2.5,
								flexDirection: 'row',
								alignItems: 'center',
							}}
							onPress={posting.toggle_title}
						>
							<Text style={ posting.show_title ? { fontWeight: '500', color: App.theme_button_text_color() } : { color: App.theme_button_text_color() }}>Show title field { posting.show_title ? <Image source={CheckmarkIcon} style={{ width: 12, height: 12, tintColor: App.theme_button_text_color() }} /> : null }</Text>
						</TouchableOpacity>
					</View>
				</View>
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
						onPress={() => App.open_url("https://help.micro.blog/t/markdown-reference/", true)}
					>
						<Text style={{ color: App.theme_button_text_color() }}>Markdown reference</Text>
					</TouchableOpacity>
				</View>
      </ScrollView>
    )
  }
  
}