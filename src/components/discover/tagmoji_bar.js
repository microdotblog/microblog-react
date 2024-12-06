import * as React from 'react';
import { observer } from 'mobx-react';
import Discover from '../../stores/Discover'
import { TouchableOpacity, View, Text, Platform, Image, TextInput, Keyboard } from 'react-native';
import App from '../../stores/App'
import SearchIcon from '../../assets/icons/nav/discover.png';
import SearchBar from '../../components/search_bar';
import { SFSymbol } from "react-native-sfsymbols";
import { SvgXml } from 'react-native-svg';

@observer
export default class TagmojiBar extends React.Component{
  
  render() {
    if (Discover.tagmoji.length > 0) {
      if (Discover.search_shown) {
        return (
          <SearchBar
            placeholder="Search for people and posts"
            onSubmitEditing={() => {Discover.trigger_search(); Keyboard.dismiss()}}
            onChangeText={(text) => Discover.set_search_query(text)}
            value={Discover.search_query}
            onCancel={() => {
                Discover.toggle_search_bar();
            }}
          />
        )
      }
      else {
        return (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 15,
              paddingVertical: 10,
              width: '100%',
              height: 50,
              backgroundColor: App.theme_input_background_color(),
            }}>
            <Text style={{color: App.theme_text_color(), maxWidth: '70%'}}>Some posts from the community.</Text>
            <View 
              style={{
                flexDirection: 'row'
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: App.theme_header_button_background_color(),
                  borderColor: App.theme_border_color(),
                  borderWidth: 1,
                  padding: 4,
                  borderRadius: 5
                }}
                onPress={() => App.open_sheet("tagmoji_menu")}
              >
                <Text>{Discover.random_tagmoji}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: App.theme_header_button_background_color(),
                  borderColor: App.theme_border_color(),
                  borderWidth: 1,
                  padding: 4,
                  paddingHorizontal: 6,
                  borderRadius: 5,
                  marginLeft: 5,
                  marginRight: 4
                }}
                onPress={Discover.toggle_search_bar}
              >
              {
                Platform.OS === "ios" ?
                <SFSymbol
                  name={"magnifyingglass"}
                  color={App.theme_button_text_color()}
                  style={{ height: 18, width: 18 }}
                />
                :
                <Image source={SearchIcon} style={{ height: 22, width: 22, tintColor: App.theme_button_text_color() }} />
              }
              </TouchableOpacity>
            </View>
          </View>
        )
      }
    return null
  }
 } 
}