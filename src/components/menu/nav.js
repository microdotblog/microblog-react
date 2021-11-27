import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Auth from './../../stores/Auth';
import App from './../../stores/App';

// Nav icons
import Bookmarks from './../../assets/icons/nav/bookmarks.png';
import Timeline from './../../assets/icons/nav/timeline.png';
import Discover from './../../assets/icons/nav/discover.png';
import Mentions from './../../assets/icons/nav/mentions.png';

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
  }

  _render_menu_items = () => {
    return this.menu.map(item => {
      let image = null
      switch(item.toLowerCase()){
        case "timeline":
        image = Timeline
        break;
        case "mentions":
        image = Mentions
        break;
        case "discover":
        image = Discover
        break;
        case "bookmarks":
        image = Bookmarks
        break;
      }
      return(
        <TouchableOpacity
          onPress={() => App.navigate_to_screen_from_menu(item)}
          key={item}
          style={{ 
            width: '100%',
            padding: 8,
            paddingHorizontal: 16,
            borderRadius: 5,
            backgroundColor: "#F9FAFB",
            marginBottom: 5,
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          {
            image != null ?
            <Image source={image} style={{ marginRight: 8, height: 20, width: 20, marginTop: 2 }} />
            : null
          }
          <Text style={{ fontSize: 20, fontWeight: '400' }}>{item}</Text>
        </TouchableOpacity>
      )
    })
  }

  render() {
    if(Auth.selected_user != null){
      return(
        <View
          style={{
            width: '100%',
            marginBottom: 15,
            paddingBottom: 10,
            borderColor: '#E5E7EB',
            borderBottomWidth: 1
          }}
        >
          {this._render_menu_items()}
        </View>
      )
    }
    return null
  }

}
