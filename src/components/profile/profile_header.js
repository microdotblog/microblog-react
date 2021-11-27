import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import MicroBlogApi, { API_ERROR } from './../../api/MicroBlogApi';
import App from './../../stores/App';

@observer
export default class ProfileHeader extends React.Component{
  
  constructor(props){
    super(props)
    this.state = {
      loading: true,
      profile: null
    }
  }
  
  componentDidMount = async () => {
    console.log("Profile header mounted for:", this.props.username)
    const profile = await MicroBlogApi.get_profile(this.props.username)
    if(profile && profile !== API_ERROR){
      this.setState({
        loading: false,
        profile: profile
      })
    }
    else if(profile === API_ERROR){
      this.setState({ loading: false })
    }
  }
  
  _render_profile = () => {
    const { profile } = this.state;
    return(
      <View style={{ padding: 8, backgroundColor: "#E5E7EB", width: '100%' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={{ uri: profile.author.avatar }} style={{ width: 50, height: 50, borderRadius: 50 }} />
          <View style={{ marginLeft: 15 }}>
            <Text style={{ fontWeight: '700', fontSize: 18 }}>{profile.author.name}</Text>
            <Text style={{ fontWeight: '300' }}>@{profile._microblog.username}</Text>
            {
              profile.author.url != null ?
              <TouchableOpacity onPress={() => App.open_url(profile.author.url)}>
                <Text style={{ color: "#f80", fontWeight: '600' }}>{profile.author.url.replace("https://", "").replace("http://", "")}</Text>
              </TouchableOpacity>
              : null
            }
          </View>
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