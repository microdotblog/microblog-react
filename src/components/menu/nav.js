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
            width: '49%',
            padding: 8,
            paddingHorizontal: 16,
            borderRadius: 20,
            backgroundColor: "#F9FAFB",
            marginBottom: 8,
            flexDirection: 'row',
            alignItems: 'center',
            //justifyContent: 'center'
          }}
        >
          {
            image != null ?
            <Image source={image} style={{ marginRight: 8, height: 22, width: 22, marginTop: 1 }} />
            : null
          }
          <Text style={{ fontSize: 16, fontWeight: '500', color: '#1F2937' }}>{item}</Text>
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
            paddingBottom: 20,
            paddingTop: 10,
            borderColor: '#E5E7EB',
            borderBottomWidth: 1,
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            flexDirection: 'row'
          }}
        >
          {this._render_menu_items()}
        </View>
      )
    }
    return null
  }

}
