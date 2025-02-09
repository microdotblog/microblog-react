import * as React from "react"
import { observer } from "mobx-react"
import { 
  ScrollView, 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  Platform, 
  ActivityIndicator,
  KeyboardAvoidingView
} from "react-native"
import { SFSymbol } from "react-native-sfsymbols"
import { SvgXml } from "react-native-svg"
import App from "../../stores/App"
import Auth from "../../stores/Auth"

@observer
export default class MutingScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      new_item: "",
      adding_type: null, // "user", "block", or "keyword"
      input_ref: null,
      scroll_ref: null
    }
  }

  componentDidMount() {
    const { selected_user } = Auth
    if (selected_user?.muting) {
      selected_user.muting.hydrate()
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.adding_type !== prevState.adding_type && this.state.adding_type !== null) {
      // Auto focus the input when it appears
      setTimeout(() => {
        this.state.input_ref?.focus()
        // Scroll the input into view with a slight delay to ensure the input is rendered
        setTimeout(() => {
          this.state.input_ref?.measureInWindow((x, y, width, height) => {
            this.state.scroll_ref?.scrollTo({
              y: Math.max(0, y - 250), // Increased offset to show section title, with minimum of 0
              animated: true
            })
          })
        }, 100)
      }, 100)
    }
  }

  _handle_add = () => {
    const { new_item, adding_type } = this.state
    const { selected_user } = Auth

    if (!new_item.trim()) {
      return
    }

    if (adding_type === "user") {
      selected_user.muting.mute_user(new_item)
    } else if (adding_type === "block") {
      selected_user.muting.mute_user(new_item, true)
    } else if (adding_type === "keyword") {
      selected_user.muting.mute_keyword(new_item)
    }

    this.setState({ new_item: "", adding_type: null })
  }

  _handle_unmute = (id, type, name) => {
    const { selected_user } = Auth
    Alert.alert(
      "Confirm Unmute",
      `Are you sure you want to unmute ${type === "keyword" ? `"${name}"` : `@${name}`}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Unmute", 
          style: "destructive",
          onPress: () => selected_user.muting.unmute_item(id)
        }
      ]
    )
  }

  _render_add_section = (title, type) => {
    const { adding_type, new_item } = this.state
    const { selected_user } = Auth
    const is_active = adding_type === type
    const is_loading = selected_user.muting.is_sending_mute || selected_user.muting.is_sending_unmute

    return (
      <View style={{ marginBottom: 5 }}>
        <View style={{ 
          flexDirection: "row", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: 10,
          paddingHorizontal: 10,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontWeight: "700", color: App.theme_text_color() }}>{title}</Text>
            {is_loading && (
              <ActivityIndicator 
                size="small" 
                color={App.theme_accent_color()} 
                style={{ marginLeft: 8 }}
              />
            )}
          </View>
          {
            !is_active &&
            <TouchableOpacity 
              onPress={() => this.setState({ adding_type: type, new_item: "" })}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: App.theme_button_background_color(),
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 17
              }}
            >
              {
                Platform.OS === "ios" ?
                  <SFSymbol
                    name="plus"
                    color={App.theme_accent_color()}
                    style={{ height: 16, width: 16, marginRight: 6 }}
                  />
                :
                  <SvgXml
                    style={{ height: 16, width: 16, marginRight: 6 }}
                    color={App.theme_accent_color()}
                    xml='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>'
                  />
              }
              <Text style={{ color: App.theme_accent_color(), fontWeight: "500" }}>Add</Text>
            </TouchableOpacity>
          }
        </View>
        {
          is_active &&
          <View style={{ flexDirection: "column", marginBottom: 10, paddingHorizontal: 10 }}>
            <TextInput
              ref={ref => this.state.input_ref = ref}
              style={{
                height: 40,
                borderWidth: 1,
                borderColor: App.theme_alt_border_color(),
                borderRadius: 8,
                paddingHorizontal: 10,
                marginBottom: 10,
                color: App.theme_text_color(),
                backgroundColor: App.theme_input_background_color()
              }}
              placeholder={type === "keyword" ? "Enter word or phrase" : "Enter username"}
              placeholderTextColor={App.theme_placeholder_text_color()}
              value={new_item}
              onChangeText={(text) => this.setState({ new_item: text })}
              onSubmitEditing={this._handle_add}
              returnKeyType="done"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity 
                style={{ 
                  backgroundColor: App.theme_button_background_color(),
                  paddingVertical: 8,
                  paddingHorizontal: 15,
                  borderRadius: 8,
                  marginRight: 10
                }}
                onPress={() => this.setState({ adding_type: null, new_item: "" })}
              >
                <Text style={{ color: App.theme_text_color(), fontWeight: "500" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ 
                  backgroundColor: App.theme_accent_color(),
                  paddingVertical: 8,
                  paddingHorizontal: 15,
                  borderRadius: 8,
                  justifyContent: "center",
                  flexDirection: "row",
                  alignItems: "center"
                }}
                onPress={this._handle_add}
              >
                <Text style={{ color: "#fff", fontWeight: "500" }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
      </View>
    )
  }

  _render_list = (items, type) => {
    if (!items.length) {
      return null
    }

    const { selected_user } = Auth
    const is_loading = selected_user.muting.is_sending_unmute

    return (
      <View style={{ 
        paddingHorizontal: 12,
        backgroundColor: App.theme_settings_group_background_color(),
        borderRadius: 8,
        marginBottom: 20,
        opacity: is_loading ? 0.5 : 1
      }}>
        {
          items.map((item, index) => (
            <View
              key={`${type}-${item.id}`}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 10,
                borderBottomWidth: index < items.length - 1 ? 1 : 0,
                borderColor: App.theme_alt_border_color()
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <Text 
                  style={{ 
                    fontSize: 16, 
                    color: App.theme_text_color()
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {type === "keyword" ? item.keyword : `@${item.username}`}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => this._handle_unmute(item.id, type, type === "keyword" ? item.keyword : item.username)}
                style={{ padding: 5 }}
              >
                {
                  Platform.OS === "ios" ? (
                    <SFSymbol
                      name="xmark"
                      color={App.theme_warning_text_color()}
                      style={{ height: 20, width: 20 }}
                    />
                  ) : (
                    <SvgXml
                      style={{ height: 20, width: 20 }}
                      color={App.theme_warning_text_color()}
                      xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>'
                    />
                  )
                }
              </TouchableOpacity>
            </View>
          ))
        }
      </View>
    )
  }

  render() {
    const { selected_user } = Auth
    const { muting } = selected_user

    return (
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 110 : 0}
      >
        <ScrollView 
          ref={ref => this.state.scroll_ref = ref}
          style={{ flex: 1, backgroundColor: App.theme_background_color() }}
          contentContainerStyle={{ padding: 15, paddingBottom: 25 }}
          keyboardShouldPersistTaps="handled"
        >
          {this._render_add_section("Muted Users", "user")}
          {this._render_list(muting.muted_users.filter(u => !u.is_hiding_other_replies), "user")}
          
          {this._render_add_section("Blocked Users", "block")}
          {this._render_list(muting.blocked_users, "block")}
          
          {this._render_add_section("Muted Keywords", "keyword")}
          {this._render_list(muting.muted_keywords, "keyword")}
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }
}
