import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, ActivityIndicator } from 'react-native';
import MicroBlogApi, { API_ERROR } from './../../api/MicroBlogApi';

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
      return(
        <View style={{ padding: 8, backgroundColor: "#E5E7EB", width: '100%' }}>
          <Text>This is a profile view for {this.props.username}</Text>
        </View>
      )
    }
    return(
      <View style={{ padding: 8, backgroundColor: "#E5E7EB", width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <Text>An error occured loading the user profile.</Text>
      </View>
    )
  }
  
}