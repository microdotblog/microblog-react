import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Auth from './../../stores/Auth';
import App from './../../stores/App';

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
      return(
        <TouchableOpacity onPress={() => App.navigate_to_screen_from_menu(item)} key={item}><Text>{item}</Text></TouchableOpacity>
      )
    })
  }

  render() {
    if(Auth.selected_user != null){
      return(
        <View
          style={{
            width: '100%',
          }}
        >
          {this._render_menu_items()}
        </View>
      )
    }
    return null
  }

}
