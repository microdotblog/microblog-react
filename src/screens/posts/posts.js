import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, TextInput, Keyboard, Image } from 'react-native';
import Auth from './../../stores/Auth';
import LoginMessage from '../../components/info/login_message'
import App from '../../stores/App'
import PostCell from '../../components/cells/post_cell';
import { SheetProvider } from "react-native-actions-sheet";
import SearchIcon from '../../assets/icons/nav/discover.png';
import { SFSymbol } from "react-native-sfsymbols";
import { SvgXml } from 'react-native-svg';

@observer
export default class PostsScreen extends React.Component{
  
  componentDidMount(){
    Auth.selected_user.posting?.selected_service?.update_posts_for_active_destination()
  }
  
  _return_header = () => {
    const { config } = Auth.selected_user.posting.selected_service
    return(
      !App.post_search_is_open ?
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
        <TouchableOpacity onPress={() => App.open_sheet("posts_destination_menu", { type: "posts" })}>
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
          onPress={App.toggle_post_search_is_open}
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
        height: 50,
        backgroundColor: App.theme_input_background_color(),
        flexDirection: "row",
        alignItems: "center"
      }}>
      <TouchableOpacity
        style={{
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: App.theme_header_button_background_color(),
          borderColor: App.theme_border_color(),
          borderWidth: 1,
          padding: 4,
          borderRadius: 50,
          marginRight: 8,
          width: 28,
          height: 28
        }}
        onPress={() => {
          App.toggle_post_search_is_open();
          App.set_posts_query("", null);
        }}
      >
      {
        Platform.OS === "ios" ?
        <SFSymbol
          name={"xmark"}
          color={App.theme_button_text_color()}
          style={{ height: 12, width: 12 }}
        />
        :
        <SvgXml
          style={{
            height: 12,
            width: 12
          }}
          stroke={App.theme_button_text_color()}
          strokeWidth={2}
          xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>'
        />
      }
      </TouchableOpacity>
      <TextInput
        placeholderTextColor="lightgrey"
        placeholder={"Search posts"}
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
          paddingHorizontal: 10,
          paddingVertical: 4,
          minWidth: "85%",
          color: App.theme_text_color()
        }}
        onSubmitEditing={() => {Keyboard.dismiss()}}
        onChangeText={(text) => App.set_posts_query(text, config.posts_destination())}
        value={App.post_search_query}
      />
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
        extraData={config.posts_for_destination()?.length && !selected_service.is_loading_posts}
        keyExtractor={this._key_extractor}
        renderItem={this.render_post_item}
        style={{
          backgroundColor: App.theme_background_color_secondary(),
          width: "100%"
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
    return (
      <SheetProvider>
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
      </SheetProvider>
    )
  }
  
}