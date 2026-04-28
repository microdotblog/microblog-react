import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, TextInput, Keyboard, Dimensions, Image, Platform } from 'react-native';
import Auth from './../../stores/Auth';
import LoginMessage from '../../components/info/login_message'
import App from '../../stores/App'
import { SheetProvider } from "react-native-actions-sheet";
import UploadCell from '../../components/cells/upload_cell'
import TempUploadCell from '../../components/cells/temp_upload_cell'
import SearchIcon from '../../assets/icons/nav/discover.png';
import SearchBar from '../../components/search_bar';
import { SFSymbol } from "react-native-sfsymbols";
import { SvgXml } from 'react-native-svg';
import DeviceInfo from 'react-native-device-info';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import { tabBarScrollContentBottomPadding } from '../../utils/ui'

@observer
export default class UploadsScreen extends React.Component{
  
  constructor (props) {
    super(props)

    this.flatListRef = React.createRef();
    this.requested_uploads_key = null
    this.state = {
      num_columns: DeviceInfo.isTablet() ? 4 : 3
    }
  }

  componentDidMount() {
    this._refresh_uploads_if_needed()
  }

  componentDidUpdate() {
    this._refresh_uploads_if_needed()
  }

  _current_uploads_context = () => {
    const selected_service = Auth.selected_user.posting?.selected_service
    const destination = selected_service?.config?.uploads_destination()
    return { selected_service, destination }
  }

  _uploads_request_key = (selected_service, destination) => {
    return `${selected_service?.id || ""}:${destination?.uid || ""}`
  }

  _refresh_uploads_if_needed = () => {
    const { selected_service, destination } = this._current_uploads_context()
    if (!selected_service || !destination) {
      return
    }

    const request_key = this._uploads_request_key(selected_service, destination)
    if (request_key === this.requested_uploads_key) {
      return
    }

    this.requested_uploads_key = request_key
    selected_service.check_for_uploads_for_destination(destination)
  }
  
  _scroll_to_top = () => {
    if (this.flatListRef.current) {
      this.flatListRef.current.scrollToOffset({ animated: false, offset: 0 });
    }
  }
  
  _return_header = () => {
    const { config } = Auth.selected_user.posting.selected_service
    return(
      !App.uploads_search_is_open ?
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 15,
          paddingVertical: 10,
          width: '100%',
          height: 50,
          backgroundColor: App.theme_input_background_color(),
        }}>
        <TouchableOpacity onPress={() => !this.props.did_open_from_editor ? App.open_sheet("posts_destination_menu", { type: "uploads" }) : null}>
          <Text style={{color: App.theme_text_color(), fontWeight: "500", fontSize: 16}}>
            {config.posts_destination()?.name}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: App.theme_header_button_background_color(),
            borderColor: App.theme_border_color(),
            borderWidth: 1,
            padding: 4,
            paddingHorizontal: 6,
            borderRadius: 5,
            marginLeft: 5,
          }}
          onPress={App.toggle_uploads_search_is_open}
        >
        {
          Platform.OS === "ios" ?
          <SFSymbol
            name={"magnifyingglass"}
            color={App.theme_button_text_color()}
            style={{ height: 18, width: 18 }}
          />
          :
          <Image source={SearchIcon} style={{ height: 22, width: 22, tintColor: App.theme_button_text_color() }} />
        }
        </TouchableOpacity>
      </View>
      :
      <SearchBar
        placeholder="Search uploads"
        onSubmitEditing={() => {Keyboard.dismiss()}}
        onChangeText={(text) => {
          App.set_uploads_query(text, config.posts_destination());
          this._scroll_to_top();
        }}
        value={App.uploads_search_query}
        onCancel={() => {
          App.toggle_uploads_search_is_open();
          App.set_uploads_query("", null);
        }}
      />        
    )
  }
  
  _key_extractor = (item) => item.url;
  
  render_upload_item = ({ item }) => {
    return(
      <UploadCell
        key={item.url}
        upload={item}
        add_to_editor={this.props.route?.params?.did_open_from_editor}
        trigger_pop={() => this.props.navigation.goBack()}
      />
    )
  }
  
  _return_uploads_list = () => {
    const { selected_service } = Auth.selected_user.posting
    const { config } = selected_service
    const destination = config.uploads_destination()
    const uploads = config.uploads_for_destination()?.slice() || []
    const list_key = `${selected_service.id}-${destination?.uid || "uploads"}-${this.state.num_columns}`
    return(
      <SafeAreaInsetsContext.Consumer>
        {insets => {
          const bottom_padding = tabBarScrollContentBottomPadding(insets?.bottom, 10)

          return (
            <FlatList
              key={list_key}
              ref={this.flatListRef}
              data={uploads}
              extraData={`${list_key}-${uploads.length}-${selected_service.is_loading_uploads}`}
              keyExtractor={this._key_extractor}
              renderItem={this.render_upload_item}
              style={{
                backgroundColor: App.theme_background_color_secondary(),
                width: "100%",
                flex: 1
              }}
              contentContainerStyle={{ paddingBottom: bottom_padding }}
              scrollIndicatorInsets={Platform.OS === 'ios' ? { bottom: bottom_padding } : undefined}
              numColumns={this.state.num_columns}
              initialNumToRender={12}
              maxToRenderPerBatch={6}
              windowSize={5}
              refreshControl={
                <RefreshControl
                  refreshing={selected_service.is_loading_uploads}
                  onRefresh={() => destination && selected_service.check_for_uploads_for_destination(destination)}
                />
              }
            />
          )
        }}
      </SafeAreaInsetsContext.Consumer>
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
    const temp_uploads = config.temp_uploads_for_destination()?.slice() || []
    const dimension = (Dimensions.get("screen")?.width / 4) + 5
    if (temp_uploads.length) {
      return (
        <FlatList
          data={temp_uploads}
          extraData={`${temp_uploads.length}-${selected_service.is_loading_uploads}`}
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
