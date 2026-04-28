import * as React from "react";
import { observer } from "mobx-react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  Platform,
  ActivityIndicator,
} from "react-native";
import App from "../../stores/App";
import Auth from "../../stores/Auth";
import Push from "../../stores/Push";
import Settings from "../../stores/Settings";
import UserPostingSettings from "../../components/settings/user_posting";
import UserMutingSettings from "../../components/settings/user_muting";
import MBImage from "../../components/common/MBImage";

@observer
export default class SettingsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      push_permissions: false,
    };
  }

  componentDidMount() {
    Push.has_push_permissions((has_permissions) => {
      this.setState({ push_permissions: has_permissions });
    });
  }

  _set_auto_android_theme = async (enabled) => {
    await Settings.set_auto_android_theme(enabled)
    await App.sync_current_theme(Platform.OS === "android")
  }

  _render_appearance_settings = () => {
    if (Platform.OS !== "android") {
      return null
    }

    return (
      <View>
        <Text
          style={{
            fontWeight: "500",
            marginBottom: 10,
            marginTop: 15,
            marginLeft: 10,
            color: App.theme_text_color(),
          }}
        >
          Appearance
        </Text>
        <View
          style={{
            paddingHorizontal: 12,
            backgroundColor: App.theme_settings_group_background_color(),
            borderRadius: 8,
          }}
        >
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 10,
            }}
          >
            <Text style={{ fontSize: 16, color: App.theme_text_color() }}>
              Auto theme
            </Text>
            <Switch
              value={Settings.auto_android_theme}
              onValueChange={this._set_auto_android_theme}
              trackColor={{
                false: App.theme_switch_track_color(),
                true: App.theme_accent_color()
              }}
              thumbColor={
                Settings.auto_android_theme
                  ? "#ffffff"
                  : App.theme === "dark" ? "#f4f3f4" : "#f4f3f4"
              }
            />
          </View>
        </View>
      </View>
    )
  }

  _render_browser_settings = () => {
    return (
      <View>
        <Text
          style={{
            fontWeight: "500",
            marginBottom: 10,
            marginTop: 15,
            marginLeft: 10,
            color: App.theme_text_color(),
          }}
        >
          Browser
        </Text>
        <View
          style={{
            paddingHorizontal: 12,
            backgroundColor: App.theme_settings_group_background_color(),
            borderRadius: 8,
          }}
        >
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderColor: App.theme_border_color(),
            }}
          >
            <Text style={{ fontSize: 16, color: App.theme_text_color() }}>
              Open links in external browser
            </Text>
            <Switch
              value={Settings.open_links_in_external_browser}
              onValueChange={Settings.toggle_open_links_in_external_browser}
              trackColor={{
                false: App.theme_switch_track_color(),
                true: App.theme_accent_color()
              }}
              thumbColor={
                Settings.open_links_in_external_browser
                  ? "#ffffff"
                  : App.theme === "dark" ? "#f4f3f4" : "#f4f3f4"
              }
              ios_backgroundColor={App.theme_switch_track_color()}
            />
          </View>
          {Platform.OS === "ios" && (
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 10,
              }}
            >
              <Text style={{ fontSize: 16, color: App.theme_text_color() }}>
                Reader View
              </Text>
              <Switch
                disabled={Settings.open_links_in_external_browser}
                value={
                  Settings.open_links_in_external_browser
                    ? false
                    : Settings.open_links_with_reader_mode
                }
                onValueChange={Settings.toggle_open_links_with_reader_mode}
                trackColor={{
                  false: App.theme_switch_track_color(),
                  true: App.theme_accent_color()
                }}
                thumbColor={
                  (Settings.open_links_in_external_browser
                    ? false
                    : Settings.open_links_with_reader_mode)
                    ? "#ffffff"
                    : App.theme === "dark" ? "#f4f3f4" : "#f4f3f4"
                }
                ios_backgroundColor={App.theme_switch_track_color()}
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  _render_push_settings = () => {
    const show_user_identity = Auth.users.length > 1

    return (
      <View style={{ marginTop: 15 }}>
        <Text
          style={{
            fontWeight: "500",
            marginBottom: 10,
            marginTop: 15,
            marginLeft: 10,
            color: App.theme_text_color(),
          }}
        >
          Push Notifications
        </Text>
        {!this.state.push_permissions && (
          <View
            style={{
              backgroundColor: App.theme === "dark" ? "#374151" : "#e8eaed",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginHorizontal: 10,
              marginBottom: 15,
              borderLeftWidth: 3,
              borderLeftColor: App.theme_accent_color(),
            }}
          >
            <Text
              style={{
                color: App.theme_text_color(),
                fontSize: 14,
                fontWeight: "500",
                lineHeight: 20,
              }}
            >
              Push notifications are disabled in your device settings. Enable them to receive notifications from your accounts.
            </Text>
          </View>
        )}
        <View
          style={{
            paddingHorizontal: 12,
            backgroundColor: App.theme_settings_group_background_color(),
            borderRadius: 8,
          }}
        >
          {Auth.users.map((user, index) => {
            return (
              <View
                key={`user-${user.username}-${index}`}
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
                  {show_user_identity && (
                    <MBImage
                      source={`${user.avatar}?v=${App.now()}`}
                      contentFit="contain"
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 50,
                        marginRight: 8,
                      }}
                    />
                  )}
                  <Text style={{ fontSize: 16, color: App.theme_text_color() }}>
                    {show_user_identity ? `@${user.username}` : "Enable push notifications"}
                  </Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                  {user.toggling_push && (
                    <ActivityIndicator
                      animating={true}
                      color={App.theme_accent_color()}
                      style={{ marginRight: 10 }}
                    />
                  )}
                  <Switch
                    disabled={user.toggling_push}
                    value={user.is_registered_for_push()}
                    onValueChange={user.toggle_push_notifications}
                    trackColor={{
                      false: App.theme_switch_track_color(),
                      true: App.theme_accent_color()
                    }}
                    thumbColor={
                      user.is_registered_for_push()
                        ? "#ffffff"
                        : App.theme === "dark" ? "#f4f3f4" : "#f4f3f4"
                    }
                    ios_backgroundColor={App.theme_switch_track_color()}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  _render_posting_settings = () => {
    const show_user_identity = Auth.users.length > 1

    return (
      <View style={{ marginTop: 15 }}>
        <Text
          style={{
            fontWeight: "500",
            marginBottom: 10,
            marginTop: 15,
            marginLeft: 10,
            color: App.theme_text_color(),
          }}
        >
          Post Options
        </Text>
        <Text
          style={{
            fontWeight: "300",
            marginBottom: 10,
            marginLeft: 10,
            color: App.theme_text_color(),
          }}
        >
          When writing a new blog post, post to:
        </Text>
        <View
          style={{
            paddingHorizontal: 12,
            backgroundColor: App.theme_settings_group_background_color(),
            borderRadius: 8,
          }}
        >
          {Auth.users.map((user, index) => {
            return (
              <UserPostingSettings
                componentId={this.props.componentId}
                user={user}
                index={index}
                show_user_identity={show_user_identity}
                key={`user-${user.username}-${index}`}
              />
            );
          })}
        </View>
      </View>
    );
  };

  _render_muting_settings = () => {
    const show_user_identity = Auth.users.length > 1

    return (
      <View style={{ marginTop: 15 }}>
        <Text
          style={{
            fontWeight: "500",
            marginBottom: 10,
            marginTop: 15,
            marginLeft: 10,
            color: App.theme_text_color(),
          }}
        >
          Muted Users and Keywords
        </Text>
        <View
          style={{
            paddingHorizontal: 12,
            backgroundColor: App.theme_settings_group_background_color(),
            borderRadius: 8,
          }}
        >
          {Auth.users.map((user, index) => (
            <UserMutingSettings
              key={`user-${user.username}-${index}`}
              user={user}
              index={index}
              show_user_identity={show_user_identity}
            />
          ))}
        </View>
      </View>
    );
  };

  render() {
    return (
      <ScrollView
        style={{
          flex: 1,
          padding: 15,
          backgroundColor: App.theme_background_color(),
        }}
      >
        {this._render_appearance_settings()}
        {this._render_browser_settings()}
        {this._render_posting_settings()}
        {this._render_muting_settings()}
        {this._render_push_settings()}
      </ScrollView>
    );
  }
}
