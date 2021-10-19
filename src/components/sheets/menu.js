import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Auth from './../../stores/Auth';
import DevInfo from './../dev/info';
import FastImage from 'react-native-fast-image';
import { loginScreen } from './../../screens/';
// IMAGES
import FaceImage from './../../assets/icons/face.png';
import GroupImage from './../../assets/icons/group.png';
import AccountAddImage from './../../assets/icons/account_add.png';

@observer
export default class SheetMenu extends React.Component{
  
  constructor(props){
    super(props)
    
    this.state = {
      menu_open: false
    }
  }
  
  _render_current_user = () => {
    return(
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          padding: 8,
          paddingHorizontal: 16,
          backgroundColor: this.state.menu_open ? '#E5E7EB' : '#F3F4F6',
          borderRadius: 5,
          borderBottomLeftRadius: this.state.menu_open ? 0 : 5,
          borderBottomRightRadius: this.state.menu_open ? 0 : 5
        }}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <View style={{marginRight: 15}}>
            <FastImage
              source={{
                uri: Auth.selected_user.avatar,
                priority: FastImage.priority.normal
              }}
              resizeMode={FastImage.resizeMode.contain}
              style={{ width: 40, height: 40, borderRadius: 50 }}
            />
          </View>
          <View>
            <Text style={{fontWeight: '600'}}>{Auth.selected_user.full_name}</Text>
            <Text style={{fontStyle: 'italic'}}>@{Auth.selected_user.username}</Text>
          </View>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
          <Image source={FaceImage} />
          {
            Auth.users.length > 1 ?
            <TouchableOpacity onPress={() => this.setState({menu_open: !this.state.menu_open})} style={{padding: 5, marginLeft: 8}}>
              <Image source={GroupImage} />
            </TouchableOpacity>
            :
            <TouchableOpacity onPress={loginScreen} style={{padding: 5, marginLeft: 8}}>
              <Image source={AccountAddImage} />
            </TouchableOpacity>
          }
        </View>
      </TouchableOpacity>
    )
  }
  
  _render_account_switcher = () => {
    return(
      <View 
        style={{ 
          padding: 8,
          paddingHorizontal: 15,
          backgroundColor: "#F9FAFB",
          width: '100%',
          borderBottomLeftRadius: 5,
          borderBottomRightRadius: 5
        }}>
        {
          Auth.all_users_except_current().map((user) => {
            return(
              <TouchableOpacity
                onPress={() => Auth.select_user(user)}
                key={user.username}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  width: '100%',
                  justifyContent: 'space-between'
                }}
              >
                <View 
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <View style={{marginRight: 15}}>
                    <FastImage
                      source={{
                        uri: user.avatar,
                        priority: FastImage.priority.normal
                      }}
                      resizeMode={FastImage.resizeMode.contain}
                      style={{ width: 40, height: 40, borderRadius: 50 }}
                    />
                  </View>
                  <View>
                    <Text style={{fontWeight: '600'}}>{user.full_name}</Text>
                    <Text style={{fontStyle: 'italic'}}>@{user.username}</Text>
                  </View>
                </View>
                <Text style={{color: '#337ab7'}}>Select</Text>
              </TouchableOpacity>
            )
          })
        }
      </View>
    )
  }
  
  render() {
    if(Auth.selected_user != null){
      return(
        <View
          style={{
            padding: 15,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 16,
          }}
        >
          {this._render_current_user()}
          {this.state.menu_open ? this._render_account_switcher() : null}
          <DevInfo />
        </View>
      )
    }
    return null
  }
  
}