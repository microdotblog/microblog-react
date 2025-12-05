import React, { useEffect, useRef, useState } from "react"
import { observer } from "mobx-react"
import { View, Text, Animated, Platform } from "react-native"
import App from "../../stores/App"

const LoadingBanner = observer(({ visible, loading_text = "Loading posts...", topOffset, progress }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current
  const progressAnim = useRef(new Animated.Value(0)).current
  const sweepAnim = useRef(new Animated.Value(0)).current
  const [wasVisible, setWasVisible] = useState(false)
  const hasProgress = progress !== undefined && progress !== null && typeof progress === 'number' && !isNaN(progress)

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

  useEffect(() => {
    if (hasProgress && visible) {
      const progressValue = Math.max(0, Math.min(1, progress));
      const currentValue = progressAnim._value || 0;
      const duration = progressValue === 1 ? 400 : 200;
      Animated.timing(progressAnim, {
        toValue: progressValue,
        duration: duration,
        useNativeDriver: false,
      }).start()
    }
    else if (!hasProgress && visible) {
      const loopAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(sweepAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(sweepAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      )
      loopAnimation.start()
      return () => loopAnimation.stop()
    }
    else {
      if (hasProgress) {
        progressAnim.setValue(0)
      }
      else {
        sweepAnim.setValue(0)
      }
    }
  }, [visible, progress])

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
        <View
          style={{
            width: 60,
            height: 4,
            backgroundColor: App.theme_section_background_color(),
            borderRadius: 2,
            overflow: "hidden",
            marginLeft: 12,
          }}
        >
          {hasProgress ? (
            <Animated.View
              style={{
                height: "100%",
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                  extrapolate: "clamp",
                }),
                backgroundColor: App.theme_accent_color(),
                borderRadius: 2,
              }}
            />
          ) : (
            <Animated.View
              style={{
                height: "100%",
                width: "40%",
                backgroundColor: App.theme_accent_color(),
                borderRadius: 2,
                transform: [
                  {
                    translateX: sweepAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 36],
                    }),
                  },
                ],
              }}
            />
          )}
        </View>
      </View>
    </Animated.View>
  )
})

export default LoadingBanner

