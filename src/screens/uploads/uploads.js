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
import TempUploadCell from '../../components/cells/temp_upload_cell'

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
        <TouchableOpacity onPress={() => !this.props.did_open_from_editor ? postsDestinationBottomSheet(false, "uploads") : null}>
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
      <UploadCell
        key={item.url}
        upload={item}
        add_to_editor={this.props.did_open_from_editor}
        trigger_pop={() => Navigation.pop(this.props.componentId)}
      />
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

  _temp_key_extractor = (item) => item.uri;

  render_temporary_upload_item = ({ item }) => {
    return (
      <TempUploadCell key={item.uri} upload={item} />
    )
  }

  _return_temp_uploads_list = () => {
    const { selected_service } = Auth.selected_user.posting
    const { config } = selected_service
    const dimension = (Dimensions.get("screen")?.width / 4) + 5
    if (config.temp_uploads_for_destination()?.length) {
      return (
        <FlatList
          data={config.temp_uploads_for_destination()}
          extraData={config.temp_uploads_for_destination()?.length && !selected_service.is_loading_uploads}
          keyExtractor={this._temp_key_extractor}
          renderItem={this.render_temporary_upload_item}
          style={{
            width: "100%",
            minHeight: dimension,
            borderBottomColor: App.theme_border_color(),
            borderBottomWidth: 2,
            paddingBottom: 10,
            marginBottom: 10
          }}
          horizontal={true}
        />
      )
    }
    else {
      return null
    }
  }
  
  render() {
    return (
      <SheetProvider>
        <View style={{ flex: 1, alignItems: 'center', backgroundColor: App.theme_background_color_secondary() }}>
          {
            Auth.is_logged_in() && !Auth.is_selecting_user ?
              <>
                {this._return_header()}
                {this._return_temp_uploads_list()}
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