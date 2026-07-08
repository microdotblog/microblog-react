import { Platform } from 'react-native'
import App from '../stores/App'
import { android_status_bar_style } from './theme'
import { isLiquidGlass } from './ui'

export function android_status_bar_options() {
  if (Platform.OS !== 'android') {
    return {}
  }

  return {
    // Draw under a transparent status bar so navbar chrome provides the colour.
    // Toolbar top inset (CustomToolbar patch) keeps header controls below the bar.
    statusBarTranslucent: true,
    statusBarStyle: android_status_bar_style(App.is_dark_mode()),
  }
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
