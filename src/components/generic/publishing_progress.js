import React, { useEffect, useRef, useState } from "react"
import { observer } from "mobx-react"
import { View, Text, TouchableOpacity, Animated, Platform } from "react-native"
import { SFSymbol } from "react-native-sfsymbols"
import App from "../../stores/App"

const PublishingProgress = observer(() => {
  const slideAnim = useRef(new Animated.Value(200)).current
  const progressAnim = useRef(new Animated.Value(0)).current
  const [wasVisible, setWasVisible] = useState(false)
  const [lastProgress, setLastProgress] = useState(0)

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
      toValue: 200,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start()
  }

  const animateProgress = (progress) => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }

  const handleClose = () => {
    App.manually_hide_publishing_progress()
  }

  useEffect(() => {
    if (App.publishing_progress_visible && !wasVisible) {
      slideIn()
      setWasVisible(true)
    }
    else if (!App.publishing_progress_visible && wasVisible) {
      slideOut()
      setWasVisible(false)
    }
  }, [App.publishing_progress_visible, wasVisible])

  useEffect(() => {
    if (App.publishing_progress !== lastProgress) {
      animateProgress(App.publishing_progress)
      setLastProgress(App.publishing_progress)
    }
  }, [App.publishing_progress, lastProgress])

  useEffect(() => {
    if (App.publishing_progress_visible) {
      slideIn()
      setWasVisible(true)
    }
  }, [])

  if (!App.publishing_progress_visible) {
    return null
  }

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: Platform.OS === "ios" ? 85 : 60,
        left: 12,
        right: 12,
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
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", color: App.theme_text_color() }}>
          Publishing Post
        </Text>
        <TouchableOpacity
          onPress={handleClose}
          style={{
            padding: 4,
            borderRadius: 6,
            backgroundColor: App.theme_button_background_color(),
          }}
        >
          {Platform.OS === "ios" ? (
            <SFSymbol
              name="xmark"
              color={App.theme_text_color()}
              size={14}
            />
          ) : (
            <Text style={{ color: App.theme_text_color(), fontSize: 14 }}>✕</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={{ fontSize: 14, color: App.theme_text_color(), marginBottom: 8 }}>
        {App.publishing_status}
      </Text>

      <View style={{
        height: 6,
        backgroundColor: App.theme_section_background_color(),
        borderRadius: 3,
        overflow: "hidden",
      }}>
        <Animated.View
          style={{
            height: "100%",
            backgroundColor: App.theme_accent_color(),
            borderRadius: 3,
            width: progressAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ["0%", "100%"],
              extrapolate: "clamp",
            }),
          }}
        />
      </View>
    </Animated.View>
  )
})

export default PublishingProgress 