import React, { useEffect, useRef, useState } from "react"
import { observer } from "mobx-react"
import { View, Text, Animated, Platform, ActivityIndicator } from "react-native"
import App from "../../stores/App"

const LoadingBanner = observer(({ visible, loading_text = "Loading posts...", topOffset }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current
  const [wasVisible, setWasVisible] = useState(false)

  const slideIn = () => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start()
  }

  const slideOut = () => {
    Animated.spring(slideAnim, {
      toValue: -100,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start()
  }

  useEffect(() => {
    if (visible && !wasVisible) {
      slideIn()
      setWasVisible(true)
    }
    else if (!visible && wasVisible) {
      slideOut()
      setWasVisible(false)
    }
  }, [visible, wasVisible])

  if (!visible && !wasVisible) {
    return null
  }

  const defaultTop = Platform.OS === "ios" ? 12 : 8
  const top = topOffset !== undefined ? topOffset : defaultTop

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: top,
        left: 12,
        right: 12,
        zIndex: 1000,
        backgroundColor: App.theme_background_color(),
        borderRadius: 12,
        padding: 12,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 1,
        borderColor: App.theme_border_color(),
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 15, fontWeight: "500", color: App.theme_text_color() }}>
          {loading_text}
        </Text>
        <ActivityIndicator
          animating={true}
          color={App.theme_accent_color()}
          size="small"
        />
      </View>
    </Animated.View>
  )
})

export default LoadingBanner

