import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import Auth from './../../stores/Auth';
import App from './../../stores/App';
import { SFSymbol } from "react-native-sfsymbols";

// Nav icons
import Bookmarks from './../../assets/icons/nav/bookmarks.png';
import Timeline from './../../assets/icons/nav/timeline.png';
import Discover from './../../assets/icons/nav/discover.png';
import Mentions from './../../assets/icons/nav/mentions.png';
import Help from './../../assets/icons/nav/help.png';
import Replies from './../../assets/icons/nav/replies.png';

@observer
export default class MenuNavigation extends React.Component{

  constructor(props){
    super(props)

    this.menu = [
      "Timeline",
      "Mentions",
      "Bookmarks",
      "Discover"
    ]

    this.secondary_menu = [
      "Replies",
      "Help"
    ]
  }

  _render_menu_items = () => {
    return this.menu.map(item => {
      let image = null
      let symbol = null
      switch(item.toLowerCase()){
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
      }
      return this._return_nav_item(item, image, symbol)
    })
  }

  _render_secondary_menu_items = () => {
    return this.secondary_menu.map(item => {
      let image = null
      let symbol = null
      switch(item.toLowerCase()){
        case "help":
          Platform.OS === 'ios' ? symbol = "questionmark.circle" : image = Help
        break;
        case "replies":
          Platform.OS === 'ios' ? symbol = "arrowshape.turn.up.left.2" : image = Replies
        break;
      }
      return this._return_nav_item(item, image, symbol)
    })
  }
  
  _return_nav_item = (item, image = null, symbol = null) => {
    return(
      <TouchableOpacity
        onPress={() => App.navigate_to_screen_from_menu(item)}
        key={item}
        style={{ 
          width: '49%',
          padding: 8,
          paddingHorizontal: 16,
          borderRadius: 20,
          backgroundColor: App.theme_button_background_color(),
          marginBottom: 8,
          flexDirection: 'row',
          alignItems: 'center'
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
            : null
        }
        <Text style={{ fontSize: 16, fontWeight: '500', color: App.theme_button_text_color() }}>{item}</Text>
      </TouchableOpacity>
    )
  }

  render() {
    if(Auth.selected_user != null){
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
            flexWrap: 'wrap',
            flexDirection: 'row'
          }}
        >
          {this._render_menu_items()}
          <View style={{
            paddingTop: 15,
            marginTop: 10,
            paddingBottom: 5,
            borderColor: App.theme_alt_border_color(),
            borderTopWidth: 1,
            width: '100%',
            flexWrap: 'wrap',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
            {this._render_secondary_menu_items()}
          </View>
        </View>
      )
    }
    return null
  }

}
