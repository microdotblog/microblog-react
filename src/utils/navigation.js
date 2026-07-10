import { NativeModules, Platform } from 'react-native'
import App from '../stores/App'
import {
  android_status_bar_style,
  should_use_android_translucent_status_bar,
} from './theme'
import { isLiquidGlass } from './ui'

function android_edge_to_edge_enabled() {
  try {
    return NativeModules.NativeDeviceInfo?.getConstants?.()?.isEdgeToEdge === true
  }
  catch (error) {
    return false
  }
}

export function android_uses_translucent_status_bar() {
  return should_use_android_translucent_status_bar({
    platform_os: Platform.OS,
    platform_version: Platform.Version,
    edge_to_edge_enabled: android_edge_to_edge_enabled(),
  })
}

export function android_status_bar_options() {
  if (Platform.OS !== 'android') {
    return {}
  }

  const options = {
    statusBarStyle: android_status_bar_style(App.is_dark_mode()),
  }

  // Only draw under the status bar when CustomToolbar adds the matching top inset.
  if (android_uses_translucent_status_bar()) {
    options.statusBarTranslucent = true
  }

  return options
}

function customHeaderItem(element, options = {}) {
  return {
    type: 'custom',
    element,
    hidesSharedBackground: options.hidesSharedBackground === true
  }
}

export function headerLeftElement(renderElement, options = {}) {
  if (isLiquidGlass()) {
    return {
      unstable_headerLeftItems: () => [customHeaderItem(renderElement(), options)]
    }
  }

  return {
    headerLeft: renderElement
  }
}

export function headerRightElement(renderElement, options = {}) {
  if (isLiquidGlass()) {
    return {
      unstable_headerRightItems: () => [customHeaderItem(renderElement(), options)]
    }
  }

  return {
    headerRight: renderElement
  }
}

export function headerItemGroupStyle(gap = 10) {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap,
    paddingHorizontal: isLiquidGlass() ? 8 : 0
  }
}
