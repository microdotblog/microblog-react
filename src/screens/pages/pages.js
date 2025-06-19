import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, TextInput, Keyboard, Image, Platform, StyleSheet } from 'react-native';
import Auth from './../../stores/Auth';
import LoginMessage from '../../components/info/login_message'
import App from '../../stores/App'
import PageCell from '../../components/cells/page_cell';
import { SheetProvider } from "react-native-actions-sheet";
import SearchIcon from '../../assets/icons/nav/discover.png';
import SearchBar from '../../components/search_bar';
import { SFSymbol } from "react-native-sfsymbols";
import { SvgXml } from 'react-native-svg';

@observer
export default class PagesScreen extends React.Component{
  
  componentDidMount(){
    Auth.selected_user.posting?.selected_service?.update_pages_for_active_destination()
  }
  
  _return_header = () => {
    const { config } = Auth.selected_user.posting.selected_service
    return(
      !App.page_search_is_open ?
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
        <TouchableOpacity onPress={() => App.open_sheet("posts_destination_menu", { type: "pages" })}>
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
          onPress={App.toggle_page_search_is_open}
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
        placeholder="Search posts"
        onSubmitEditing={() => {Keyboard.dismiss()}}
        onChangeText={(text) => App.set_pages_query(text, config.posts_destination())}
        value={App.page_search_query}
        onCancel={() => {
            App.toggle_page_search_is_open();
            App.set_pages_query("", null);
        }}
      />
    )
  }
  
  _key_extractor = (item) => item.uid;
  
  render_page_item = ({ item }) => {
    return <PageCell key={item.uid} page={item} />
  }
  
  _return_pages_list = () => {
    const { selected_service } = Auth.selected_user.posting
    const { config } = selected_service
    return(
      <FlatList
        centerContent={config.pages_for_destination()?.length === 0}
        data={config.pages_for_destination()}
        extraData={config.pages_for_destination()?.length && !selected_service.is_loading_pages}
        keyExtractor={this._key_extractor}
        renderItem={this.render_page_item}
        style={{
          backgroundColor: App.theme_background_color_secondary(),
          width: "100%"
        }}
        // ListEmptyComponent={
        //   <View style={{ flex: 1, padding: 12, justifyContent: 'center', alignItems: 'center' }} >
        //     <Text style={{ color: App.theme_text_color() }}>No pages...</Text>
        //   </View>
        // }
        ItemSeparatorComponent={
          <View style={{
            height: StyleSheet.hairlineWidth,
            backgroundColor: App.theme_alt_background_div_color()
          }} />
        }
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
