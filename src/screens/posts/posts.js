import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import Auth from './../../stores/Auth';
import LoginMessage from '../../components/info/login_message'
import App from '../../stores/App'
import { Navigation } from 'react-native-navigation';
import PostCell from '../../components/cells/post_cell';

@observer
export default class PostsScreen extends React.Component{
  
  constructor (props) {
    super(props)
    Navigation.events().bindComponent(this)
  }
  
  _return_header = () => {
    const { config } = Auth.selected_user.posting.selected_service
    return(
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 15,
          paddingVertical: 10,
          width: '100%',
          backgroundColor: App.theme_input_background_color(),
        }}>
        <Text style={{color: App.theme_text_color()}}>
        {config.posts_destination()?.name} ({config.destination.length})
        </Text>
      </View>
    )
  }
  
  _key_extractor = (item) => item.uid;
  
  render_post_item = ({ item }) => {
    return(
      <PostCell key={item.uid} post={item} />
    )
  }
  
  _return_posts_list = () => {
    const { selected_service } = Auth.selected_user.posting
    const { config } = selected_service
    return(
      <FlatList
        data={config.posts_for_destination()}
        extraData={config.posts_for_destination().length && !selected_service.is_loading_posts}
        keyExtractor={this._key_extractor}
        renderItem={this.render_post_item}
        style={{
          backgroundColor: App.theme_background_color_secondary()
        }}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => selected_service.check_for_posts_for_destination(config.posts_destination())}
          />
        }
      />
    )
  }
  
  render() {
    return(
      <View style={{ flex: 1, alignItems: 'center' }}>
        {
          Auth.is_logged_in() && !Auth.is_selecting_user ?
            <>
            {this._return_header()}
            {this._return_posts_list()}
            </>
          :
          <LoginMessage title="Posts" />
        }
      </View>
    )
  }
  
}