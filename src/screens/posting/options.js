import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Auth from '../../stores/Auth';

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
					<Text style={{ fontSize: 16, fontWeight: '500' }}>Select categories for this post:</Text>
					<View style={{ backgroundColor: '#F8F8F8', padding: 8, borderRadius: 8, marginTop: 8 }}>
					{
						posting.selected_service.config.active_destination().categories.length ?
							posting.selected_service.config.active_destination().categories.map((category) => {
								return(
									<TouchableOpacity
										key={category}
										style={{
											padding: 8,
											marginBottom: 5,
										}}
									>
										<Text>{category}</Text>
									</TouchableOpacity>
								)
							})
						: <Text>No categories to display</Text>
					}
					</View>
				</View>
				{/* Blogs */}
				<View style={{ marginBottom: 25 }}>
					<Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 5 }}>Choose a default microblog to post to:</Text>
					<View style={{ backgroundColor: '#F8F8F8', padding: 8, borderRadius: 8, marginTop: 8 }}>
					{
						posting.selected_service.config.destination.map((destination) => {
							const is_selected_blog = posting.selected_service.config.active_destination() === destination
							return(
								<TouchableOpacity
									key={destination.uid}
									onPress={() => {
										posting.selected_service.config.set_default_destination(destination)
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
												<Text> (default)</Text>
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