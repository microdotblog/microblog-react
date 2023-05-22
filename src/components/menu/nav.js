import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import Auth from './../../stores/Auth';
import App from './../../stores/App';
import { SFSymbol } from "react-native-sfsymbols";
import { SvgXml } from 'react-native-svg';

// Nav icons
import Bookmarks from './../../assets/icons/nav/bookmarks.png';
import Timeline from './../../assets/icons/nav/timeline.png';
import Discover from './../../assets/icons/nav/discover.png';
import Mentions from './../../assets/icons/nav/mentions.png';
import Help from './../../assets/icons/nav/help.png';
import SettingsIcon from './../../assets/icons/toolbar/settings.png';

@observer
export default class MenuNavigation extends React.Component{

  constructor(props){
    super(props)

    this.manage_menu = [
      "Posts",
      "Pages",
      "Uploads"
    ]
    
    this.extras_menu = [
      "Replies",
      "Settings",
      "Help"
    ]
  }

  _render_secondary_menu_items = (items = []) => {
    return items.map(item => {
      let image = null
      let symbol = null
      let svg = null
      switch (item.toLowerCase()) {
        case "timeline":
          Platform.OS === 'ios' ? symbol = "bubble.left.and.bubble.right" : image = Timeline
        break;
        case "mentions":
          Platform.OS === 'ios' ? symbol = "at" : image = Mentions
        break;
        case "discover":
          Platform.OS === 'ios' ? symbol = "magnifyingglass" : image = Discover
        break;
        case "bookmarks":
          Platform.OS === 'ios' ? symbol = "star" : image = Bookmarks
        break;
        case "help":
          Platform.OS === 'ios' ? symbol = "questionmark.circle" : image = Help
        break;
        case "settings":
          Platform.OS === 'ios' ? symbol = "gearshape" : image = SettingsIcon
        break;
        case "replies":
          Platform.OS === 'ios' ? symbol = "bubble.left" :
          svg = `
          <svg fill="currentColor" viewBox="0 0 30 30" width="30px" height="30px">
          <path d="M 8 3 C 6.895 3 6 3.895 6 5 L 23 5 C 24.657 5 26 6.343 26 8 L 26 21 C 27.105 21 28 20.105 28 19 L 28 5 C 28 3.895 27.105 3 26 3 L 8 3 z M 4 7 C 2.895 7 2 7.895 2 9 L 2 23 C 2 24.105 2.895 25 4 25 L 7 25 L 7 28 A 1 1 0 0 0 8 29 A 1 1 0 0 0 8.8378906 28.542969 L 11.498047 25 L 22 25 C 23.105 25 24 24.105 24 23 L 24 9 C 24 7.895 23.105 7 22 7 L 4 7 z"></path>
          </svg>
          `
        break;
        case "posts":
          Platform.OS === 'ios' ? symbol = "doc" :
          svg = `
          <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="30px" height="30px">
          <path d="M24,4H6C4.895,4,4,4.895,4,6v18c0,1.105,0.895,2,2,2h18c1.105,0,2-0.895,2-2V6C26,4.895,25.105,4,24,4z M17,20H9 c-0.552,0-1-0.448-1-1c0-0.552,0.448-1,1-1h8c0.552,0,1,0.448,1,1C18,19.552,17.552,20,17,20z M21,16H9c-0.552,0-1-0.448-1-1 c0-0.552,0.448-1,1-1h12c0.552,0,1,0.448,1,1C22,15.552,21.552,16,21,16z M21,12H9c-0.552,0-1-0.448-1-1c0-0.552,0.448-1,1-1h12 c0.552,0,1,0.448,1,1C22,11.552,21.552,12,21,12z"></path>
          </svg>
          `
        break;
        case "pages":
          Platform.OS === 'ios' ? symbol = "rectangle.stack" :
          svg = `
          <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="30px" height="30px">
          <path d="M 14 4 C 12.895 4 12 4.895 12 6 L 12 24 C 12 25.105 12.895 26 14 26 L 24 26 C 25.105 26 26 25.105 26 24 L 26 6 C 26 4.895 25.105 4 24 4 L 14 4 z M 8.984375 4.9863281 A 1.0001 1.0001 0 0 0 8 6 L 8 24 A 1.0001 1.0001 0 1 0 10 24 L 10 6 A 1.0001 1.0001 0 0 0 8.984375 4.9863281 z M 4.984375 5.9863281 A 1.0001 1.0001 0 0 0 4 7 L 4 23 A 1.0001 1.0001 0 1 0 6 23 L 6 7 A 1.0001 1.0001 0 0 0 4.984375 5.9863281 z"></path>
          </svg>
          `
        break;
        case "uploads":
          Platform.OS === 'ios' ? symbol = "photo.on.rectangle" :
          svg = `
          <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="30px" height="30px">
          <path d="M 4 5 C 2.895 5 2 5.895 2 7 L 2 23 C 2 24.105 2.895 25 4 25 L 26 25 C 27.105 25 28 24.105 28 23 L 28 7 C 28 5.895 27.105 5 26 5 L 4 5 z M 23 8 C 24.105 8 25 8.895 25 10 C 25 11.105 24.105 12 23 12 C 21.895 12 21 11.105 21 10 C 21 8.895 21.895 8 23 8 z M 9 12.001953 C 9.61925 12.001953 10.238437 12.238437 10.710938 12.710938 L 13.972656 15.972656 L 15 17 L 16.15625 18.15625 C 16.57825 18.57825 17.259641 18.574344 17.681641 18.152344 C 18.104641 17.730344 18.104641 17.044094 17.681641 16.621094 L 16.529297 15.470703 L 17.289062 14.710938 C 18.234063 13.765937 19.765937 13.765937 20.710938 14.710938 L 25 19 L 25 22 L 5 22 L 5 15 L 7.2890625 12.710938 C 7.7615625 12.238437 8.38075 12.001953 9 12.001953 z"></path>
          </svg>
          `
        break;
      }
      return this._return_nav_item(item, image, symbol, svg)
    })
  }
  
  _return_nav_item = (item, image = null, symbol = null, svg = null) => {
    return(
      <TouchableOpacity
        onPress={() => App.navigate_to_screen_from_menu(item)}
        key={item}
        style={{ 
          width: '100%',
          padding: 8,
          paddingHorizontal: 16,
          borderRadius: 20,
          backgroundColor: App.theme_button_background_color(),
          marginBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        {
          image != null ?
            <Image source={image} style={{ marginRight: 8, height: 22, width: 22, marginTop: 1, tintColor: App.theme_button_text_color() }} />
            : symbol != null ?
              <SFSymbol
                name={symbol}
                color={App.theme_text_color()}
                style={{ marginRight: 8, height: 22, width: 22, marginTop: 1 }}
              />
            : svg != null ?
            <SvgXml
              xml={svg}
              width={22}
              height={22}
              style={{marginRight: 8}}
              stroke={App.theme_button_text_color()}
              fill={"transparent"}
            />
            : null
        }
        <Text style={{ fontSize: 16, fontWeight: '500', color: App.theme_button_text_color() }}>{item}</Text>
      </TouchableOpacity>
    )
  }

  render() {
    if(Auth.selected_user != null){
      const { posting } = Auth.selected_user
      return(
        <View
          style={{
            width: '100%',
            marginBottom: 15,
            paddingBottom: 5,
            paddingTop: 10,
            borderColor: App.theme_alt_border_color(),
            borderBottomWidth: 1,
            justifyContent: 'space-between',
            flexDirection: 'column'
          }}
        >
          {
            posting.selected_service?.type !== "xmlrpc" ?
              this._render_secondary_menu_items(this.manage_menu)
            :
            <TouchableOpacity
              onPress={() => App.navigate_to_screen_from_menu("PostService", true)}
              style={{
                borderRadius: 8,
                backgroundColor: App.theme_button_background_color(),
                padding: 12,
                marginBottom: 8,
              }}
            >
              <Text style={{
                color: App.theme_text_color()
              }}>
              Posting to {posting.selected_service?.description()}. Some menu items have been hidden. Tap here to change.
              </Text>
            </TouchableOpacity>
          }
          <View style={{
            paddingTop: 15,
            marginTop: 10,
            paddingBottom: 5,
            borderColor: App.theme_alt_border_color(),
            borderTopWidth: 1,
            width: '100%',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            {this._render_secondary_menu_items(this.extras_menu)}
          </View>
        </View>
      )
    }
    return null
  }

}
