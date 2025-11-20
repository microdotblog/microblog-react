import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, Keyboard, Image, StyleSheet, Platform } from 'react-native';
import Auth from './../../stores/Auth';
import LoginMessage from '../../components/info/login_message'
import App from '../../stores/App'
import PostCell from '../../components/cells/post_cell';
import { SheetProvider } from "react-native-actions-sheet";
import SearchIcon from '../../assets/icons/nav/discover.png';
import SearchBar from '../../components/search_bar';
import { SFSymbol } from "react-native-sfsymbols";
@observer
export default class PostsScreen extends React.Component{

  constructor(props) {
    super(props);
    this.state = {
      is_showing_drafts_button: false,
      is_showing_drafts_posts: false
    };
  }
  
  componentDidMount() {
    const { selected_service } = Auth.selected_user.posting;
    const { config } = selected_service;

    selected_service.update_posts_for_active_destination();

    this.focusListener = this.props.navigation.addListener('focus', () => {
      selected_service.check_for_posts_for_destination(config.posts_destination(), this.state.is_showing_drafts_posts);
    });
  }

  componentWillUnmount() {
    if (this.focusListener) {
      this.focusListener();
    }
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
        { this.state.is_showing_drafts_button &&
          <TouchableOpacity
            style={{
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: this.state.is_showing_drafts_posts ? App.theme_header_button_selected_background_color() : App.theme_header_button_background_color(),
              borderColor: this.state.is_showing_drafts_posts ? App.theme_header_button_selected_border_color() : App.theme_border_color(),
              borderWidth: 1,
              padding: 4,
              paddingHorizontal: 8,
              borderRadius: 5,
              marginLeft: 5,
            }}
            onPress={() => {
              const new_is_drafts = !this.state.is_showing_drafts_posts;
              this.setState({ is_showing_drafts_posts: new_is_drafts });
              const { selected_service } = Auth.selected_user.posting;
              const { config } = selected_service;
              selected_service.check_for_posts_for_destination(config.posts_destination(), new_is_drafts);
            }}
          >
            <Text style={{color: App.theme_button_text_color()}}>
              Drafts
            </Text>
          </TouchableOpacity>
        }
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
        onChangeText={(text) => App.set_posts_query(text, config.posts_destination(), this.state.is_showing_drafts_posts)}
        value={App.post_search_query}
        onCancel={() => {
            App.toggle_post_search_is_open();
            App.set_posts_query("", null, this.state.is_showing_drafts_posts);
        }}
      />
    )
  }
  
  _key_extractor = (item) => item.uid;
  
  _has_any_drafts = (posts) => {
    return posts.some(post => post["post_status"] == "draft");
  }
  
  render_post_item = ({ item }) => {
    return (
      <PostCell key={item.uid} post={item} />
    );
  }
  
  _return_posts_list = () => {
    const { selected_service } = Auth.selected_user.posting;
    const { config } = selected_service;
    
    setTimeout(() => {
      // check if we need drafts button, but if set, never unset
      if (!this.state.is_showing_drafts_button) {
        const any_drafts = this._has_any_drafts(config.posts_for_destination(this.state.is_showing_drafts_posts));
        this.setState({ is_showing_drafts_button: any_drafts });
      }
    }, 500);
    
    return(
      <FlatList
        data={config.posts_for_destination(this.state.is_showing_drafts_posts)}
        extraData={config.posts_for_destination(this.state.is_showing_drafts_posts)?.length && !selected_service.is_loading_posts}
        keyExtractor={this._key_extractor}
        renderItem={this.render_post_item}
        style={{
          backgroundColor: App.theme_background_color_secondary(),
          width: "100%",
          flex: 1
        }}
        ItemSeparatorComponent={
          <View style={{
            height: StyleSheet.hairlineWidth,
            backgroundColor: App.theme_alt_background_div_color()
          }} />
        }
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => selected_service.check_for_posts_for_destination(config.posts_destination(), this.state.is_showing_drafts_posts)}
          />
        }
      />
    )
  }
  
  render() {
    return (
      <SheetProvider>
        <View style={{ flex: 1, justifyContent: 'flex-start' }}>
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
