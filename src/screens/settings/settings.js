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
              trackColor={{ true: App.theme_accent_color() }}
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
                trackColor={{ true: App.theme_accent_color() }}
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  _render_push_settings = () => {
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
          <Text
            style={{
              color: App.theme_error_text_color(),
              paddingHorizontal: 10,
              marginBottom: 15,
              fontWeight: "500",
            }}
          >
            Push notifications are not enabled. Please enable them in your
            device settings.
          </Text>
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
                  <FastImage
                    source={{
                      uri: `${user.avatar}?v=${App.now()}`,
                      priority: FastImage.priority.normal,
                      cache: FastImage.cacheControl.web,
                    }}
                    resizeMode={FastImage.resizeMode.contain}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 50,
                      marginRight: 8,
                    }}
                  />
                  <Text style={{ fontSize: 16, color: App.theme_text_color() }}>
                    @{user.username}
                  </Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                  {user.toggling_push && (
                    <ActivityIndicator
                      animating={true}
                      color={"#f80"}
                      style={{ marginRight: 10 }}
                    />
                  )}
                  <Switch
                    disabled={user.toggling_push}
                    value={user.is_registered_for_push()}
                    onValueChange={user.toggle_push_notifications}
                    trackColor={{ true: App.theme_accent_color() }}
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
                key={`user-${user.username}-${index}`}
              />
            );
          })}
        </View>
      </View>
    );
  };

  _render_muting_settings = () => {
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
        {this._render_browser_settings()}
        {this._render_posting_settings()}
        {this._render_muting_settings()}
        {this._render_push_settings()}
      </ScrollView>
    );
  }
}
