import * as React from 'react';
import { observer } from 'mobx-react';
import Discover from '../../stores/Discover'
import { TouchableOpacity, View, Text, Platform, Image, TextInput, Keyboard } from 'react-native';
import { tagmojiBottomSheet } from '../../screens'
import App from '../../stores/App'
import SearchIcon from '../../assets/icons/nav/discover.png';
import { SFSymbol } from "react-native-sfsymbols";

@observer
export default class TagmojiBar extends React.Component{
  
  render() {
    if (Discover.tagmoji.length > 0) {
      return (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 15,
            paddingVertical: Discover.search_shown ? 12 : 10,
            width: '100%',
            backgroundColor: App.theme_input_background_color(),
          }}>
          {
            !Discover.search_shown ?
            <>
              <Text style={{color: App.theme_text_color(), maxWidth: '70%'}}>Some recent posts from the community</Text>
              <View 
                style={{
                  flexDirection: 'row'
                }}
              >
                <TouchableOpacity
                  style={{
                    borderColor: App.theme_border_color(),
                    borderWidth: 1,
                    padding: 4,
                    borderRadius: 5
                  }}
                  onPress={() => tagmojiBottomSheet()}
                >
                  <Text>{Discover.random_tagmoji}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    borderColor: App.theme_border_color(),
                    borderWidth: 1,
                    padding: 4,
                    paddingHorizontal: 6,
                    borderRadius: 5,
                    marginLeft: 5,
                    marginRight: 8
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
            </>
            :
            <View style={{flexDirection: "row", alignItems: "center"}}>
            <TouchableOpacity
              style={{
                justifyContent: "center",
                alignItems: "center",
                borderColor: App.theme_border_color(),
                borderWidth: 1,
                padding: 4,
                borderRadius: 50,
                marginRight: 8,
                width: 28,
                height: 28
              }}
              onPress={Discover.toggle_search_bar}
            >
            {
              Platform.OS === "ios" ?
              <SFSymbol
                name={"xmark"}
                color={App.theme_button_text_color()}
                style={{ height: 12, width: 12 }}
              />
              :
              <Image source={SearchIcon} style={{ height: 22, width: 22, tintColor: App.theme_button_text_color() }} />
            }
            </TouchableOpacity>
            <TextInput
              placeholderTextColor="lightgrey"
              placeholder={"Search for people and posts"}
              returnKeyType={'search'}
              blurOnSubmit={true}
              autoFocus={true}
              autoCorrect={true}
              autoCapitalize="none"
              clearButtonMode={'while-editing'}
              enablesReturnKeyAutomatically={true}
              underlineColorAndroid={'transparent'}
              style={{ 
                backgroundColor: App.theme_button_background_color(), 
                fontSize: 16,
                borderColor: App.theme_border_color(), 
                borderWidth: 1,
                borderRadius: 15,
                paddingHorizontal: 15,
                paddingVertical: 4,
                minWidth: "87%",
                color: App.theme_text_color()
              }}
              onSubmitEditing={() => {Discover.trigger_search(); Keyboard.dismiss()}}
              onChangeText={(text) => Discover.set_search_query(text)}
              value={Discover.search_query}
            />
            </View>
          }
          
        </View>
      )
    }
    return null
  }
  
}