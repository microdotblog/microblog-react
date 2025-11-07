import * as React from "react";
import { observer } from "mobx-react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { SFSymbol } from "react-native-sfsymbols";
import { SvgXml } from "react-native-svg";
import App from "../../stores/App";
import Auth from "../../stores/Auth";
import { Image } from "expo-image";

@observer
export default class UserMutingSettings extends React.Component {
  render() {
    const { user, index } = this.props;
    return (
      <TouchableOpacity
        onPress={() => App.navigate_to_screen("muting", user)}
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 10,
          borderBottomWidth: Auth.users.length - 1 !== index ? 1 : 0,
          borderColor: App.theme_border_color(),
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={`${user.avatar}?v=${App.now()}`}
            contentFit="contain"
            style={{ width: 24, height: 24, borderRadius: 50, marginRight: 8 }}
          />
          <Text style={{ fontSize: 16, color: App.theme_text_color() }}>
            @{user.username}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {Platform.OS === "ios" ? (
            <SFSymbol
              name="chevron.right"
              color={App.theme_text_color()}
              style={{ height: 16, width: 16 }}
            />
          ) : (
            <SvgXml
              style={{ height: 20, width: 20 }}
              color={App.theme_text_color()}
              xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>'
            />
          )}
        </View>
      </TouchableOpacity>
    );
  }
}
