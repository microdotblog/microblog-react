import * as React from "react";
import { observer } from "mobx-react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SFSymbol } from "react-native-sfsymbols";
import App from "../../stores/App";

@observer
export default class UsernameToolbar extends React.Component {
  toolbar_background_color() {
    return App.is_dark_mode() ? "rgba(55, 65, 81, 0.92)" : "rgba(255, 255, 255, 0.9)"
  }

  toolbar_border_color() {
    return App.is_dark_mode() ? "rgba(255, 255, 255, 0.12)" : "rgba(31, 41, 55, 0.12)"
  }

  toolbar_control_style() {
    return {
      backgroundColor: this.toolbar_background_color(),
      borderColor: this.toolbar_border_color(),
      borderRadius: 22,
      borderWidth: StyleSheet.hairlineWidth,
      width: 38,
      minHeight: 38,
      marginRight: 5,
      alignItems: "center",
      justifyContent: "center",
    }
  }

  render() {
    if (App.found_users.length == 0) {
      return null;
    } else {
      return (
        <View
          style={{
            width: "100%",
            backgroundColor: App.theme_background_color(),
            paddingHorizontal: 6,
            paddingBottom: 4,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            style={this.toolbar_control_style()}
            onPress={() => App.clear_found_users()}
            accessibilityRole="button"
            accessibilityLabel="Close username suggestions"
          >
            {
              Platform.OS === "ios" ?
                <SFSymbol
                  name={"xmark"}
                  color={App.theme_text_color()}
                  style={{ height: 14, width: 14 }}
                />
              :
                <Text
                  style={{
                    color: App.theme_text_color(),
                    fontSize: 16,
                    fontWeight: "600",
                    lineHeight: 18,
                  }}
                >
                  x
                </Text>
            }
          </TouchableOpacity>
          <View
            style={{
              flex: 1,
              backgroundColor: this.toolbar_background_color(),
              borderColor: this.toolbar_border_color(),
              borderRadius: 22,
              borderWidth: StyleSheet.hairlineWidth,
              paddingVertical: 2,
              paddingHorizontal: 5,
              minHeight: 38,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <ScrollView
              keyboardShouldPersistTaps={"always"}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              style={{ overflow: "hidden" }}
              contentContainerStyle={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {App.found_users.map((u, index) => {
                return (
                  <TouchableOpacity
                    key={index}
                    style={{
                      marginRight: 4,
                      paddingVertical: 4,
                      paddingHorizontal: 10,
                      borderRadius: 18,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                    onPress={() => {
                      App.update_autocomplete(u.username, this.props.object);
                    }}
                  >
                    <Image
                      source={{ uri: u.avatar }}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        marginRight: 4,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 15,
                        textAlign: "center",
                        color: App.theme_text_color(),
                      }}
                    >
                      @{u.username}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      );
    }
  }
}
