import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import App from './../../stores/App';
import Auth from '../../stores/Auth';
import { SvgXml } from 'react-native-svg';
import { SFSymbol } from "react-native-sfsymbols";

@observer
export default class TagFilterHeader extends React.Component{
  
  render() {
    if(Auth.selected_user?.selected_tag != null){
      return(
        <View style={{ padding: 11, paddingHorizontal: 15, backgroundColor: App.theme_input_contrast_background_color(), width: '100%', flexDirection: "row", justifyContent: "space-between" }}>
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
                width: 26,
                height: 26
              }}
              onPress={() => Auth.selected_user?.set_selected_tag(null)}
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
                color={App.theme_button_text_color()}
                strokeWidth={2}
                xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>'
              />
            }
            </TouchableOpacity>
            <Text style={{ color: App.theme_text_color(), fontSize: 16 }}>tag: {Auth.selected_user?.selected_tag}</Text>
          </View>
        </View>
      )
    }
    return null
  }
  
}
