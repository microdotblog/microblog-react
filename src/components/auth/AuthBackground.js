import React from 'react'
import { StyleSheet, View } from 'react-native'
import { observer } from 'mobx-react'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

import App from '../../stores/App'

function with_opacity(hex_color = '', opacity = 1) {
  const normalized = `${hex_color || ''}`.trim()
  const match = normalized.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
  if (!match) {
    return `rgba(255, 136, 0, ${opacity})`
  }

  let hex = match[1]
  if (hex.length === 3) {
    hex = hex.split('').map(char => `${char}${char}`).join('')
  }

  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

function get_background_layers(is_dark, accent) {
  if (is_dark) {
    return {
      base: '#15100b',
      mid: '#1c140c',
      glow: with_opacity(accent, 0.14),
      edge: with_opacity(accent, 0.08),
    }
  }

  return {
    base: '#fffaf0',
    mid: '#fff5e0',
    glow: with_opacity(accent, 0.16),
    edge: with_opacity(accent, 0.1),
  }
}

function AuthBackground() {
  const is_dark = App.is_dark_mode()
  const accent = App.theme_accent_color()
  const layers = get_background_layers(is_dark, accent)
  const glow_shift = useSharedValue(0)

  React.useEffect(() => {
    glow_shift.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 16000,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(0, {
          duration: 16000,
          easing: Easing.inOut(Easing.sin),
        }),
      ),
      -1,
      false,
    )
  }, [glow_shift])

  const glow_style = useAnimatedStyle(() => {
    return {
      opacity: 0.55 + glow_shift.value * 0.2,
      transform: [
        { translateX: 10 - glow_shift.value * 24 },
        { translateY: -14 + glow_shift.value * 28 },
        { scale: 1.05 + glow_shift.value * 0.06 },
      ],
    }
  }, [])

  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={[styles.canvas, { backgroundColor: layers.base }]} />
      <View style={[styles.mid, { backgroundColor: layers.mid }]} />
      <Animated.View
        style={[
          styles.glow,
          glow_style,
          { backgroundColor: layers.glow },
        ]}
      />
      <View style={[styles.edge, { backgroundColor: layers.edge }]} />
    </View>
  )
}

export default observer(AuthBackground)

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  edge: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.55,
  },
  glow: {
    borderRadius: 280,
    height: 420,
    position: 'absolute',
    right: -80,
    top: -40,
    width: 420,
  },
  mid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.55,
  },
})
