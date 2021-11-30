import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, ActivityIndicator, Image, TouchableOpacity, ScrollView } from 'react-native';
import MicroBlogApi, { API_ERROR } from './../../api/MicroBlogApi';
import App from './../../stores/App';
import Hyperlink from 'react-native-hyperlink'
import { followingScreen } from './../../screens/'

@observer
export default class ProfileHeader extends React.Component{
  
  constructor(props){
    super(props)
    this.state = {
      loading: true,
      profile: null,
      more_expanded: false,
      is_toggling_follow: false
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
  
  _load_profile = async () => {
    const profile = await MicroBlogApi.get_profile(this.props.username)
    if(profile && profile !== API_ERROR){
      this.setState({
        loading: false,
        profile: profile,
        is_toggling_follow: false
      })
    }
    else if(profile === API_ERROR){
      this.setState({ loading: false, is_toggling_follow: false })
    }
  }
  
  _render_profile = () => {
    const { profile, more_expanded } = this.state;
    const long_bio = profile._microblog.bio ? profile._microblog.bio.trim().replace(/\n/g, " ") : null
    const short_bio = long_bio ? long_bio.slice(0, 90) : null
    const show_expand_option = long_bio?.length > short_bio?.length
    return(
      <View style={{ padding: 8, backgroundColor: "#E5E7EB", width: '100%' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={{ uri: profile.author.avatar }} style={{ width: 50, height: 50, borderRadius: 50 }} />
          <View style={{ marginLeft: 15 }}>
            <Text style={{ fontWeight: '700', fontSize: 18, marginBottom: 2 }}>{profile.author.name}</Text>
            <Text style={{ fontWeight: '300' }}>@{profile._microblog.username}</Text>
            {
              profile.author.url != null ?
              <TouchableOpacity style={{ marginTop: 2 }} onPress={() => App.open_url(profile.author.url)}>
                <Text style={{ color: "#f80", fontWeight: '600' }}>{profile.author.url.replace("https://", "").replace("http://", "")}</Text>
              </TouchableOpacity>
              : null
            }
          </View>
        </View>
        
        <View style={{position: 'relative'}}>
        <ScrollView style={{marginTop: 5, marginBottom: 5, maxHeight: more_expanded ? 205 : 'auto'}}>
        {
          profile._microblog.bio && more_expanded ?
          <Hyperlink linkDefault={ true } linkStyle={{ textDecorationLine: 'underline' }}>
            <Text style={{ paddingBottom: 20 }}>{profile._microblog.bio}</Text>
          </Hyperlink>
          :
          profile._microblog.bio && !more_expanded ?
          <Hyperlink linkDefault={ true } linkStyle={{ textDecorationLine: 'underline' }}>
            <Text style={{ position: 'relative' }}>
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
              backgroundColor: '#E5E7EB',
              paddingHorizontal: 5,
              borderRadius: 5
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
            borderColor: '#D1D5DB', 
            paddingTop: 3, 
            marginTop: 3, 
            justifyContent: 'space-between', 
            flexDirection: 'row'
          }}>
          <TouchableOpacity onPress={() => followingScreen(this.props.username, App.current_screen_id)}>
            <Text style={{ fontStyle: 'italic', fontWeight: '500' }}>{profile._microblog.is_you ? `Following ${profile._microblog.following_count} users` : `Following ${profile._microblog.discover_count} users you're not following`}</Text>
          </TouchableOpacity>
          {
            !profile._microblog.is_you ?
            <TouchableOpacity onPress={this._toggle_follow} style={{marginRight: 5}}>
              { this.state.is_toggling_follow ? 
                <ActivityIndicator color="#f80" />
                :
                <Text style={{ fontWeight: '500', color: '#337ab7' }}>{profile._microblog.is_following ? 'Unfollow' : 'Follow'}</Text>
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
        <View style={{ backgroundColor: "#E5E7EB", padding: 8, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <ActivityIndicator color="#f80" />
        </View>
      )
    }
    if(!loading && profile != null){
      return this._render_profile()
    }
    return(
      <View style={{ padding: 8, backgroundColor: "#E5E7EB", width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <Text>An error occured loading the user profile.</Text>
      </View>
    )
  }
  
}