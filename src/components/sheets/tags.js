import * as React from 'react';
import { observer } from 'mobx-react';
import { ScrollView, TouchableOpacity, Text, Platform, TextInput, Keyboard, View } from 'react-native';
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import App from '../../stores/App'
import Auth from '../../stores/Auth'
import { SvgXml } from 'react-native-svg';
import { SFSymbol } from "react-native-sfsymbols";

@observer
export default class TagsMenu extends React.Component{
  
  _render_tags = () => {
    return Auth.selected_user?.filtered_tags().map((tag) => {
      return(
        <TouchableOpacity
          key={`tag-${tag}`}
          onPress={() => {
            Auth.selected_user.set_selected_tag(tag)
            SheetManager.hide(this.props.sheetId);
          }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 15,
            borderColor: App.theme_border_color()
          }}
        >
          {
            Platform.OS === "ios" ?
            <SFSymbol
              name={"tag"}
              color={App.theme_button_text_color()}
              style={{ height: 16, width: 16, marginRight: 10 }}
            />
            :
            <SvgXml
              style={{
                height: 16,
                width: 16,
                marginRight: 10,
                ...Platform.select({
                  android: {
                    marginTop: 1
                  }
                })
              }}
              color={App.theme_button_text_color()}
              xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" /></svg>'
            />
          }
          <Text style={{ 
            color: App.theme_button_text_color(),
            ...Platform.select({
              android: {
                textAlignVertical: 'center',
                includeFontPadding: false
              }
            })
          }}>
            {tag}
          </Text>
        </TouchableOpacity>
      )
    })
  }
  
  render() {
    return(
      <ActionSheet
        id={this.props.sheetId}
        snapPoints={[40,95]}
        initialSnapIndex={[1]}
        overdrawEnabled={true}
        useBottomSafeAreaPadding={true}
        gestureEnabled={true}
        containerStyle={{
          backgroundColor: App.theme_background_color_secondary()
        }}
      >
      <View
        style={{
          padding: 15,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 16,
          paddingBottom: 5
        }}
      >
        <Text style={{ fontWeight: '800', marginBottom: 15, color: App.theme_text_color() }}>Tags</Text>
        <TextInput
          placeholderTextColor="lightgrey"
          placeholder={"Search tags..."}
          returnKeyType={'search'}
          blurOnSubmit={true}
          //autoFocus={true}
          autoCorrect={true}
          autoCapitalize="none"
          clearButtonMode={'always'}
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
            minWidth: "100%",
            color: App.theme_text_color()
          }}
          onSubmitEditing={Keyboard.dismiss}
          onChangeText={(text) => Auth.selected_user.set_bookmark_tag_filter_query(text)}
          value={Auth.selected_user.bookmark_tag_filter_query}
        />
      </View>
      <ScrollView keyboardShouldPersistTaps={'always'} style={{maxHeight: 700, marginBottom: 25, paddingHorizontal: 25}} {...this.scrollHandlers}>
        {this._render_tags()}
      </ScrollView>
      </ActionSheet>
    )
  }
  
}
