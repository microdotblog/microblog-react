import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, ActivityIndicator, Image, TouchableOpacity, ScrollView } from 'react-native';
import MicroBlogApi, { API_ERROR } from './../../api/MicroBlogApi';
import App from './../../stores/App';
import Hyperlink from 'react-native-hyperlink'
import { followingScreen, profileMoreBottomSheet } from './../../screens/'
import MoreIconWhite from './../../assets/icons/more_white.png'
import MoreIconHorizontal from './../../assets/icons/more_ios.png'
import MoreIconHorizontalWhite from './../../assets/icons/more_ios_white.png'

@observer
export default class ProfileHeader extends React.Component{
  
  constructor(props){
    super(props)
    this.state = {
      loading: true,
      profile: null,
      more_expanded: false,
      is_toggling_follow: false,
      is_mastodon: false
    }
  }
  
  componentDidMount = async () => {
    this._load_profile()
  }
  
  _toggle_follow = async () => {
    this.setState({ is_toggling_follow: true })
    const follow_status = this.state.profile._microblog.is_following ? await MicroBlogApi.unfollow_user(this.props.username) : await MicroBlogApi.follow_user(this.props.username)
    if(follow_status !== API_ERROR){
      this._load_profile()
    }
    else{
      this.setState({ is_toggling_follow: false })
    }
  }

  _toggle_more = () => {
    profileMoreBottomSheet(this.props.username)
  }
  
  _load_profile = async () => {
    const profile = await MicroBlogApi.get_profile(this.props.username)
    if(profile && profile !== API_ERROR){
      this.setState({
        loading: false,
        profile: profile,
        is_toggling_follow: false,
        is_mastodon: profile._microblog.username.includes("@")
      })
    }
    else if(profile === API_ERROR){
      this.setState({ loading: false, is_toggling_follow: false })
    }
  }
  
  _render_profile = () => {
    const { profile, more_expanded } = this.state;
    const long_bio = profile._microblog.bio ? profile._microblog.bio.trim().replace(/&amp;/g, "&") : null
    const short_bio = long_bio ? long_bio.slice(0, 90).replace(/\n/g, " ") : null
    const show_expand_option = long_bio?.length > short_bio?.length
    return(
      <View style={{ padding: 12, backgroundColor: App.theme_button_background_color(), width: '100%' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => App.set_image_modal_data_and_activate(`${profile.author.avatar}${!this.state.is_mastodon ? `?v=${App.now()}`: ""}`)}>
            <Image source={{ uri: `${profile.author.avatar}${!this.state.is_mastodon ? `?v=${App.now()}`: ""}` }} style={{ width: 50, height: 50, borderRadius: 50 }} />
          </TouchableOpacity>
          <View style={{ marginLeft: 15 }}>
            <Text style={{ fontWeight: '700', fontSize: 18, marginBottom: 2, color: App.theme_text_color() }}>{profile.author.name}</Text>
            {
              profile._microblog?.pronouns &&
                <Text style={{ fontWeight: '300', color: App.theme_text_color() }}>{profile._microblog.pronouns}</Text>
            }
            {
              profile.author.url != null ?
              <TouchableOpacity style={{ marginTop: 2 }} onPress={() => App.open_url(profile.author.url)}>
                <Text style={{ color: "#f80", fontWeight: '600' }}>{profile.author.url.replace("https://", "").replace("http://", "")}</Text>
              </TouchableOpacity>
              : null
            }
          </View>
          {
            !profile._microblog.is_you ?
              <TouchableOpacity
                onPress={this._toggle_more}
                style={{
                  position: 'absolute',
                  right: 2,
                  top: 2,
                  padding: 2,
                  backgroundColor: App.theme_profile_button_background_color(),
                  borderRadius: 50,
                }}
              >
                <Image source={ Platform.OS === 'ios' ? ( App.theme == "dark" ? MoreIconHorizontalWhite : MoreIconHorizontal ) : ( App.theme == "dark" ? MoreIconWhite : MoreIconHorizontalWhite )} style={{ width: 24, height: 24 }} />
              </TouchableOpacity>
            : null
          }
        </View>
        
        <View style={{position: 'relative'}}>
        <ScrollView style={{marginTop: 5, marginBottom: 5, maxHeight: more_expanded ? 205 : 'auto'}}>
        {
          long_bio && more_expanded ?
          <Hyperlink onPress={(url) => App.handle_url_from_webview(url)} linkStyle={{ textDecorationLine: 'underline' }}>
            <Text style={{ paddingBottom: 20, color: App.theme_text_color() }}>{long_bio}</Text>
          </Hyperlink>
          :
          long_bio && !more_expanded ?
          <Hyperlink onPress={(url) => App.handle_url_from_webview(url)} linkStyle={{ textDecorationLine: 'underline' }}>
            <Text style={{ position: 'relative', color: App.theme_text_color() }}>
              {short_bio}{ long_bio.length > short_bio.length ? "..." : "" }
            </Text>
          </Hyperlink>
          : null
        }
        </ScrollView>
        {
          show_expand_option ?
          <TouchableOpacity
            onPress={() => this.setState({ more_expanded: !this.state.more_expanded })}
            style={{ 
              position: 'absolute',
              right: 0,
              bottom: 5,
              paddingHorizontal: 5
            }}
          >
            <Text style={{ fontWeight: '400', color: '#f80' }}>{more_expanded ? "Show less" : "Show more"}</Text>
          </TouchableOpacity>
          :
          null
        }
        </View>
        <View 
          style={{ 
            borderTopWidth: .5,
            borderColor: App.theme_alt_background_div_color(), 
            paddingTop: 10, 
            marginTop: 8,
            paddingBottom: 0,
            justifyContent: 'space-between', 
            flexDirection: 'row',
            alignItems: 'center'
          }}>
          <TouchableOpacity style={{maxWidth: '80%'}} onPress={() => followingScreen(this.props.username, App.current_screen_id)}>
            <Text style={{ fontWeight: '500', paddingVertical: 5, color: App.theme_text_color() }}>{profile._microblog.is_you ? `Following ${profile._microblog.following_count} ${profile._microblog.following_count > 1 ? "users" : "user"}` : ( profile._microblog.discover_count == 0 ? "" : `Following ${profile._microblog.discover_count} ${profile._microblog.discover_count > 1 ? "users" : "user"} you're not following` )}</Text>
          </TouchableOpacity>
          {
            !profile._microblog.is_you ?
            <TouchableOpacity onPress={this._toggle_follow} style={{marginRight: 2, paddingTop: 8, paddingBottom: 8, paddingLeft: 10, paddingRight: 10, borderRadius: 20, backgroundColor: App.theme_profile_button_background_color()}}>
              { this.state.is_toggling_follow ? 
                <ActivityIndicator color="#f80" />
                :
                <Text style={{ fontWeight: '500', color: App.theme_profile_button_text_color() }}>{profile._microblog.is_following ? 'Unfollow' : 'Follow'}</Text>
              }
            </TouchableOpacity>
            : null
          }
        </View>
      </View>
    )
  }
  
  render() {
    const { loading, profile } = this.state
    if(loading){
      return(
        <View style={{ backgroundColor: App.theme_section_background_color(), padding: 8, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <ActivityIndicator color="#f80" />
        </View>
      )
    }
    if(!loading && profile != null){
      return this._render_profile()
    }
    return(
      <View style={{ padding: 8, backgroundColor: App.theme_section_background_color(), width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{color: App.theme_text_color()}}>An error occured loading the user profile.</Text>
      </View>
    )
  }
  
}