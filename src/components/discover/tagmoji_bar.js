import * as React from 'react';
import { observer } from 'mobx-react';
import Discover from '../../stores/Discover'
import { TouchableOpacity, View, Text, Platform, Image, TextInput, Keyboard } from 'react-native';
import { tagmojiBottomSheet } from '../../screens'
import App from '../../stores/App'
import SearchIcon from '../../assets/icons/nav/discover.png';
import { SFSymbol } from "react-native-sfsymbols";
import { SvgXml } from 'react-native-svg';

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
            paddingVertical: 10,
            width: '100%',
            height: 50,
            backgroundColor: App.theme_input_background_color(),
          }}>
          {
            !Discover.search_shown ?
            <>
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
                  onPress={() => tagmojiBottomSheet()}
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
            </>
            :
            <View style={{flexDirection: "row", alignItems: "center"}}>
            <TouchableOpacity
              style={{
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: App.theme_header_button_background_color(),
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
              <SvgXml
                style={{
                  height: 12,
                  width: 12
                }}
                stroke={App.theme_button_text_color()}
                strokeWidth={2}
                xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>'
              />
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
                minWidth: "89%",
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