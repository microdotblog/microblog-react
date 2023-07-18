import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, TextInput } from 'react-native';
import Auth from './../../stores/Auth';
import LoginMessage from '../../components/info/login_message'
import App from '../../stores/App'
import { Navigation } from 'react-native-navigation';
import PageCell from '../../components/cells/page_cell';
import { postsDestinationBottomSheet } from '..'
import { SheetProvider } from "react-native-actions-sheet";
import SearchIcon from '../../assets/icons/nav/discover.png';
import { SFSymbol } from "react-native-sfsymbols";

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
      !App.page_search_is_open ?
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
        <TouchableOpacity
          style={{
            justifyContent: "center",
            alignItems: "center",
            borderColor: App.theme_border_color(),
            borderWidth: 2,
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
      <View style={{
        paddingHorizontal: 8,
        paddingVertical: 11,
        width: '100%',
        backgroundColor: App.theme_input_background_color(),
        flexDirection: "row"
      }}>
      <TouchableOpacity
        style={{
          justifyContent: "center",
          alignItems: "center",
          borderColor: App.theme_border_color(),
          borderWidth: 2,
          padding: 4,
          borderRadius: 50,
          marginRight: 8,
          width: 28,
          height: 28
        }}
        onPress={App.toggle_page_search_is_open}
      >
      {
        Platform.OS === "ios" ?
        <SFSymbol
          name={"xmark"}
          color={App.theme_button_text_color()}
          style={{ height: 12, width: 12 }}
        />
        :
        <Image source={SearchIcon} style={{ height: 22, width: 22, tintColor: App.theme_button_text_color() }} />
      }
      </TouchableOpacity>
      <TextInput
        placeholderTextColor="lightgrey"
        placeholder={"Search for pages"}
        returnKeyType={'search'}
        blurOnSubmit={true}
        autoFocus={true}
        autoCorrect={true}
        autoCapitalize="none"
        clearButtonMode={'while-editing'}
        enablesReturnKeyAutomatically={true}
        underlineColorAndroid={'transparent'}
        style={{ 
          backgroundColor: App.theme_button_background_color(), 
          fontSize: 16,
          borderColor: App.theme_border_color(), 
          borderWidth: 1,
          borderRadius: 15,
          paddingHorizontal: 15,
          paddingVertical: 4,
          minWidth: "85%",
          color: App.theme_text_color()
        }}
        //onSubmitEditing={() => {Discover.trigger_search(); Keyboard.dismiss()}}
        //onChangeText={(text) => Discover.set_search_query(text)}
        //value={Discover.search_query}
      />
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
          backgroundColor: App.theme_background_color_secondary(),
          width: "100%"
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