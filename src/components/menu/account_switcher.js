import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import Auth from './../../stores/Auth';
import App from './../../stores/App';
import FastImage from 'react-native-fast-image';
import { loginScreen, profileScreen } from './../../screens/';
import { SFSymbol } from 'react-native-sfsymbols';
// IMAGES
import AddAccountImage from './../../assets/icons/add_account.png';

@observer
export default class AccountSwitcher extends React.Component{

  constructor (props) {
    super(props)
    let now = new Date()
    now.setHours(0, 0, 0, 0)
    this.now = now
  }
  
  _render_current_user = () => {
    return(
			<TouchableOpacity
				onPress={() => profileScreen(Auth.selected_user.username, App.current_screen_id)}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          padding: 8,
          paddingHorizontal: 16,
          backgroundColor: App.theme_button_background_color(),
          borderRadius: 20,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0
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
                uri: `${Auth.selected_user.avatar}?v=${this.now}`,
                priority: FastImage.priority.normal,
                cache: FastImage.cacheControl.web
              }}
              resizeMode={FastImage.resizeMode.contain}
              style={{ width: 40, height: 40, borderRadius: 50 }}
            />
          </View>
          <View>
            <Text style={{fontWeight: '600', color: App.theme_button_text_color()}}>{Auth.selected_user.full_name}</Text>
            <Text style={{ color: App.theme_button_text_color() }}>@{Auth.selected_user.username}</Text>
          </View>
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
          backgroundColor: App.theme_button_background_color(),
          width: '100%',
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20
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
                        uri: `${user.avatar}?v=${this.now}`,
                        priority: FastImage.priority.normal,
                        cache: FastImage.cacheControl.web
                      }}
                      resizeMode={FastImage.resizeMode.contain}
                      style={{ width: 40, height: 40, borderRadius: 50 }}
                    />
                  </View>
                  <View>
                    <Text style={{fontWeight: '600', color: App.theme_button_text_color()}}>{user.full_name}</Text>
                    <Text style={{color: App.theme_button_text_color()}}>@{user.username}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          })
        }
				{this._render_add_account_button()}
				{this._render_account_logout_button()}
      </View>
    )
  }
  
  _render_add_account_button = () => {
    return(
      <TouchableOpacity
        onPress={loginScreen}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
          justifyContent: 'space-between',
          marginTop: Auth.users.length > 1 ? 10 : 0,
          paddingTop: Auth.users.length > 1 ? 8 : 0
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {
            Platform.OS === 'ios' ?
            <View
              style={{
                height: 40,
                width: 40,
                borderRadius: 50,
                marginRight: 8,
                backgroundColor: App.theme_input_background_color(),
                alignItems: 'center',
                justifyContent: 'center'
              }}>
              <SFSymbol
                name={'plus'}
                color={App.theme_text_color()}
                style={{ height: 18, width: 18 }}
                multicolor={true}
              />
            </View>
            :
            <Image style={{width: 30, height: 30, marginRight: 18, marginLeft: 6, tintColor: App.theme_button_text_color()}} source={AddAccountImage} />
          }
          
          <Text style={{ color: App.theme_button_text_color() }}>Add Account...</Text>
        </View>
      </TouchableOpacity>
    )
	}
	
	_render_account_logout_button = () => {
    const sign_out_wording = Auth.users?.length > 1 ? `Sign Out of @${Auth.selected_user.username}` : "Sign Out"
		return (
			<TouchableOpacity
				onPress={() => Auth.logout_user()}
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					width: '100%',
					justifyContent: 'space-between',
					borderTopWidth: .5,
					borderColor: '#D1D5DB',
					paddingTop: 8,
					paddingBottom: 5,
					marginTop: 10
				}}
			>
				<View style={{ flexDirection: 'row', alignItems: 'center', width: "100%", justifyContent: 'center' }}>
					<Text style={{color: 'red'}}>{sign_out_wording}</Text>
				</View>
			</TouchableOpacity>
    )
	}
  
  render() {
    if(Auth.selected_user != null){
      return(
        <View
          style={{
            width: '100%',
            paddingTop: 15
          }}
        >
          {this._render_current_user()}
					{this._render_account_switcher()}
        </View>
      )
		}
		return null
  }
  
}