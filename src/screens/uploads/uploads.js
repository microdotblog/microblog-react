import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import Auth from './../../stores/Auth';
import LoginMessage from '../../components/info/login_message'
import App from '../../stores/App'
import { Navigation } from 'react-native-navigation';
import { postsDestinationBottomSheet } from '..'
import { SheetProvider } from "react-native-actions-sheet";
import UploadCell from '../../components/cells/upload_cell'

@observer
export default class UploadsScreen extends React.Component{
  
  constructor (props) {
    super(props)
    Navigation.events().bindComponent(this)
  }
  
  componentDidAppear(){
    Auth.selected_user.posting?.selected_service?.upate_uploads_for_active_destination()
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
        <TouchableOpacity onPress={() => postsDestinationBottomSheet(false, "uploads")}>
          <Text style={{color: App.theme_text_color(), fontWeight: "500", fontSize: 16}}>
            {config.posts_destination()?.name}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }
  
  _key_extractor = (item) => item.url;
  
  render_upload_item = ({ item }) => {
    return(
      <UploadCell key={item.url} upload={item} />
    )
  }
  
  _return_uploads_list = () => {
    const { selected_service } = Auth.selected_user.posting
    const { config } = selected_service
    return(
      <FlatList
        data={config.uploads_for_destination()}
        extraData={config.uploads_for_destination()?.length && !selected_service.is_loading_uploads}
        keyExtractor={this._key_extractor}
        renderItem={this.render_upload_item}
        style={{
          backgroundColor: App.theme_background_color_secondary(),
          width: "100%"
        }}
        contentContainerStyle={{
          alignItems: 'center'
        }}
        numColumns={3}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => selected_service.check_for_uploads_for_destination(config.posts_destination())}
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
                {this._return_uploads_list()}
              </>
            :
            <LoginMessage title="Uploads" />
          }
        </View>
      </SheetProvider>
    )
  }
  
}