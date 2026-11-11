import * as React from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { StackActions } from '@react-navigation/native'
import { observer } from 'mobx-react'
import { SafeAreaView } from 'react-native-screens/experimental'
import { SFSymbol } from 'react-native-sfsymbols'
import ProfileImage from '../header/profile_image'
import App from '../../stores/App'
import Auth from '../../stores/Auth'

const management_sources = [
  { name: 'Posts', icon: 'doc' },
  { name: 'Pages', icon: 'rectangle.stack' },
  { name: 'Uploads', icon: 'photo.on.rectangle' }
]
const replies_source = { name: 'Replies', icon: 'bubble.left' }
const management_names = new Set([...management_sources, replies_source].map(source => source.name))

function sectionPrefix(tab) {
  return `${tab.name.replace(/Stack$/, '')}-`
}

function managementRouteIndex(tab) {
  const prefix = sectionPrefix(tab)
  // Details such as Collections and Conversation stay under the section that opened them.
  return tab.state?.routes.findIndex(route => (
    route.name.startsWith(prefix) && management_names.has(route.name.slice(prefix.length))
  )) ?? -1
}

@observer
export default class SourceListLayout extends React.Component {
  dispatchToStack(action, tab) {
    this.props.navigation.dispatch({ ...action, target: tab.state.key })
  }

  selectFeed(tab) {
    const { navigation, state } = this.props
    const active_tab = state.routes[state.index]
    const management_index = managementRouteIndex(tab)

    if (management_index >= 0) {
      this.dispatchToStack(StackActions.pop(tab.state.index - management_index + 1), tab)
    }
    else if (tab.key === active_tab.key) {
      if (tab.state?.index > 0) {
        this.dispatchToStack(StackActions.popToTop(), tab)
      }
      else {
        App.scroll_web_view_to_top(tab.key)
      }
      return
    }

    if (tab.key !== active_tab.key) {
      navigation.navigate(tab.name)
    }
  }

  selectManagement(name) {
    const { navigation, state } = this.props
    const tab = state.routes[state.index]
    const screen = sectionPrefix(tab) + name
    const management_index = managementRouteIndex(tab)

    if (management_index >= 0) {
      const current_screen = tab.state.routes[management_index].name
      const detail_count = tab.state.index - management_index
      if (detail_count > 0) {
        this.dispatchToStack(StackActions.pop(detail_count), tab)
      }
      if (current_screen !== screen) {
        this.dispatchToStack(StackActions.replace(screen), tab)
      }
      return
    }

    if (tab.state?.key) {
      this.dispatchToStack(StackActions.push(screen), tab)
    }
    else {
      navigation.navigate(tab.name, { screen, initial: false })
    }
  }

  renderRow({ name, icon }, selected, onPress) {
    return (
      <Pressable
        key={name}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={onPress}
        style={({ pressed }) => [styles.row, (selected || pressed) && { backgroundColor: App.theme_section_background_color() }]}
      >
        <SFSymbol name={icon} color={App.theme_accent_color()} multicolor={false} style={styles.icon} />
        <Text style={[styles.label, { color: App.theme_text_color() }, selected && styles.selected]}>{name}</Text>
      </Pressable>
    )
  }

  renderDivider() {
    return <View style={[styles.divider, { backgroundColor: App.theme_border_color() }]} />
  }

  renderSidebar() {
    const { state, descriptors, width, icons } = this.props
    const tab = state.routes[state.index]
    const index = managementRouteIndex(tab)
    const selected_section = index >= 0 ? tab.state.routes[index].name : null
    const show_management = Auth.selected_user?.posting?.selected_service?.type !== 'xmlrpc'

    return (
      <View style={[styles.sidebar, { width, backgroundColor: App.theme_loading_banner_background_color(), borderColor: App.theme_border_color() }]}>
        <SafeAreaView edges={{ top: true, bottom: true, left: true }}>
          <ScrollView contentContainerStyle={styles.list} contentInsetAdjustmentBehavior="never">
            <View style={styles.profile}>
              <ProfileImage routeKey="sidebar" />
            </View>
            {state.routes.map(route => this.renderRow(
              { name: descriptors[route.key].options.tabBarLabel, icon: icons[route.name].ios.default },
              selected_section == null && route.key === tab.key,
              () => this.selectFeed(route)
            ))}
            {show_management && this.renderDivider()}
            {show_management && management_sources.map(source => this.renderManagementRow(source, tab, selected_section))}
            {this.renderDivider()}
            {this.renderManagementRow(replies_source, tab, selected_section)}
          </ScrollView>
        </SafeAreaView>
      </View>
    )
  }

  renderManagementRow(source, tab, selected_section) {
    const selected = selected_section === sectionPrefix(tab) + source.name
    return this.renderRow(source, selected, () => this.selectManagement(source.name))
  }

  render() {
    return (
      <View style={styles.layout}>
        {this.props.width > 0 && this.renderSidebar()}
        <View style={styles.content}>{this.props.children}</View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  layout: { flex: 1, flexDirection: 'row' },
  content: { flex: 1 },
  sidebar: { borderRightWidth: StyleSheet.hairlineWidth },
  list: { paddingHorizontal: 10, paddingVertical: 8 },
  profile: { paddingHorizontal: 12, minHeight: 44, justifyContent: 'center', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 44, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, gap: 10 },
  icon: { width: 22, height: 22 },
  label: { fontSize: 17, flex: 1 },
  selected: { fontWeight: '600' },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 8, marginHorizontal: 12 }
})
