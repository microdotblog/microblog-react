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
				{/* Categories */}
				<View style={{ marginBottom: 25 }}>
					<Text style={{ fontSize: 16, fontWeight: '500', color: App.theme_text_color() }}>Select categories for this post:</Text>
					<View style={{ backgroundColor: '#F8F8F8', padding: 8, borderRadius: 8, marginTop: 8 }}>
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
										<Text style={ is_selected ? { fontWeight: '500' } : null}>{category} { is_selected ? <Image source={CheckmarkIcon} style={{ width: 15, height: 15 }} /> : null }</Text>
									</TouchableOpacity>
								)
							})
						: <Text>No categories to display</Text>
					}
					</View>
				</View>
				{/* Blogs */}
				<View style={{ marginBottom: 25 }}>
					<Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 5, color: App.theme_text_color() }}>Choose a default microblog to post to:</Text>
					<View style={{ backgroundColor: '#F8F8F8', padding: 8, borderRadius: 8, marginTop: 8 }}>
					{
						posting.selected_service.config.destination.map((destination) => {
							const is_selected_blog = posting.selected_service.config.active_destination() === destination
							return(
								<TouchableOpacity
									key={destination.uid}
									onPress={() => {
										posting.selected_service.config.set_default_destination(destination);
										posting.remove_post_categories()
									}}
									style={{
										padding: 8,
										marginBottom: 5,
									}}
								>
									<Text style={ is_selected_blog ? { fontWeight: '500' } : null}>
										{destination.name}
										{
											is_selected_blog ?
												<Text> (default) <Image source={CheckmarkIcon} style={{ width: 15, height: 15 }} /></Text>
											: null
										}
									</Text>
								</TouchableOpacity>
							)
						}
						)
					}
					</View>
				</View>
      </ScrollView>
    )
  }
  
}