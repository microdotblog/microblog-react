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
			<ScrollView style={{ flex: 1, padding: 8 }}>
				{/* Categories */}
				<View>
					<Text>Select categories for this post:</Text>
				</View>
				{/* Blogs */}
				<View>
					<Text>Choose a default microblog to post to:</Text>
				</View>
      </ScrollView>
    )
  }
  
}