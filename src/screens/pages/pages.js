import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import Auth from './../../stores/Auth';
import LoginMessage from '../../components/info/login_message'
import App from '../../stores/App'
import { Navigation } from 'react-native-navigation';
import PageCell from '../../components/cells/page_cell';
import { postsDestinationBottomSheet } from '..'
import { SheetProvider } from "react-native-actions-sheet";

@observer
export default class PagesScreen extends React.Component{
  
  constructor (props) {
    super(props)
    Navigation.events().bindComponent(this)
  }
  
  componentDidAppear(){
    Auth.selected_user.posting?.selected_service?.upate_pages_for_active_destination()
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
        <TouchableOpacity onPress={() => postsDestinationBottomSheet(false, "pages")}>
          <Text style={{color: App.theme_text_color(), fontWeight: "500", fontSize: 16}}>
            {config.posts_destination()?.name}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }
  
  _key_extractor = (item) => item.uid;
  
  render_page_item = ({ item }) => {
    return(
      <PageCell key={item.uid} page={item} />
    )
  }
  
  _return_pages_list = () => {
    const { selected_service } = Auth.selected_user.posting
    const { config } = selected_service
    return(
      <FlatList
        data={config.pages_for_destination()}
        extraData={config.pages_for_destination()?.length && !selected_service.is_loading_pages}
        keyExtractor={this._key_extractor}
        renderItem={this.render_page_item}
        style={{
          backgroundColor: App.theme_background_color_secondary()
        }}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => selected_service.check_for_pages_for_destination(config.pages_destination())}
          />
        }
      />
    )
  }
  
  render() {
    return (
      <SheetProvider>
        <View style={{ flex: 1, alignItems: 'center' }}>
          {
            Auth.is_logged_in() && !Auth.is_selecting_user ?
              <>
              {this._return_header()}
              {this._return_pages_list()}
              </>
            :
            <LoginMessage title="Pages" />
          }
        </View>
      </SheetProvider>
    )
  }
  
}