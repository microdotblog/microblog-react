import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, TextInput, Keyboard, Image } from 'react-native';
import Auth from './../../stores/Auth';
import LoginMessage from '../../components/info/login_message'
import App from '../../stores/App'
import PostCell from '../../components/cells/post_cell';
import { SheetProvider } from "react-native-actions-sheet";
import SearchIcon from '../../assets/icons/nav/discover.png';
import SearchBar from '../../components/search_bar';
import { SFSymbol } from "react-native-sfsymbols";
import { SvgXml } from 'react-native-svg';

@observer
export default class PostsScreen extends React.Component{

  constructor(props) {
    super(props);
    this.state = {
      is_showing_drafts: false
    };
  }
  
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
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={{
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: this.state.is_showing_drafts ? App.theme_header_button_selected_color() : App.theme_header_button_background_color(),
            borderColor: App.theme_border_color(),
            borderWidth: 1,
            padding: 4,
            paddingHorizontal: 8,
            borderRadius: 5,
            marginLeft: 5,
          }}
          onPress={() => {
            const new_is_drafts = !this.state.is_showing_drafts;
            this.setState({ is_showing_drafts: new_is_drafts });
            const { selected_service } = Auth.selected_user.posting;
            const { config } = selected_service;
            selected_service.check_for_posts_for_destination(config.posts_destination(), new_is_drafts);
          }}
        >
          <Text style={{color: App.theme_button_text_color()}}>
            Drafts
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
      <SearchBar
        placeholder="Search posts"
        onSubmitEditing={() => {Keyboard.dismiss()}}
        onChangeText={(text) => App.set_posts_query(text, config.posts_destination(), this.state.is_showing_drafts)}
        value={App.post_search_query}
        onCancel={() => {
            App.toggle_post_search_is_open();
            App.set_posts_query("", null, this.state.is_showing_drafts);
        }}
      />
    )
  }
  
  _key_extractor = (item) => item.uid;
  
  render_post_item = ({ item }) => {
    return (
      <PostCell key={item.uid} post={item} />
    );
  }
  
  _return_posts_list = () => {
    const { selected_service } = Auth.selected_user.posting
    const { config } = selected_service
    return(
      <FlatList
        centerContent={config.posts_for_destination(this.state.is_showing_drafts)?.length === 0}
        data={config.posts_for_destination(this.state.is_showing_drafts)}
        extraData={config.posts_for_destination(this.state.is_showing_drafts)?.length && !selected_service.is_loading_posts}
        keyExtractor={this._key_extractor}
        renderItem={this.render_post_item}
        style={{
          backgroundColor: App.theme_background_color_secondary(),
          width: "100%"
        }}
        ListEmptyComponent={
          <View style={{ flex: 1, padding: 12, justifyContent: 'center', alignItems: 'center' }} >
            <Text style={{ color: App.theme_text_color() }}>No posts.</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => selected_service.check_for_posts_for_destination(config.posts_destination(), this.state.is_showing_drafts)}
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
