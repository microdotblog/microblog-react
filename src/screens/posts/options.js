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
					<Text style={{ fontSize: 16, fontWeight: '500', color: App.theme_text_color() }}>When sending this post to Micro.blog:</Text>
					<View style={{ backgroundColor: App.theme_button_background_color(), padding: 8, borderRadius: 8, marginTop: 8 }}>
						<TouchableOpacity
							key={"published"}
							style={{ padding: 8, marginBottom: 5, flexDirection: 'row', alignItems: 'center' }}
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
											marginBottom: 5,
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
      </ScrollView>
    )
  }
  
}