import * as React from 'react'
import { observer } from 'mobx-react'
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Platform,
  Keyboard,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import Login from './../../stores/Login'
import App from '../../stores/App'
import AuthBackground from '../../components/auth/AuthBackground'

@observer
export default class AppleUsernameScreen extends React.Component {
  componentWillUnmount() {
    Login.reset_apple_credentials()
  }

  render() {
    const is_dark = App.is_dark_mode()
    const accent = App.theme_accent_color()
    const ink = is_dark ? '#fff7e8' : '#24180d'
    const ink_soft = is_dark ? '#d9c0a8' : '#756657'
    const line = is_dark ? 'rgba(255, 136, 0, 0.22)' : 'rgba(255, 136, 0, 0.2)'
    const input_bg = is_dark ? '#1a120c' : '#fffaf0'
    const canvas = is_dark ? '#15100b' : '#fffaf0'
    const paper = is_dark ? '#21180f' : '#ffffff'

    return (
      <View style={[styles.screen, { backgroundColor: canvas }]}>
        <AuthBackground />
        <SafeAreaView edges={['bottom']} style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.flex}
          >
            <ScrollView
              bounces={false}
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.heroCopy}>
                <Text style={[styles.kicker, { color: accent }]}>
                  Create account
                </Text>
                <Text style={[styles.title, { color: ink }]}>
                  Pick a username
                </Text>
                <Text style={[styles.body, { color: ink_soft }]}>
                  Finish creating your Micro.blog account to continue.
                </Text>
              </View>

              <View style={styles.form}>
                <View
                  style={[
                    styles.inputWrap,
                    {
                      backgroundColor: input_bg,
                      borderColor: Login.show_error ? '#ea053b' : line,
                    },
                  ]}
                >
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="username"
                    autoCorrect={false}
                    autoFocus={true}
                    blurOnSubmit={true}
                    clearButtonMode="while-editing"
                    enablesReturnKeyAutomatically={true}
                    keyboardAppearance={is_dark ? 'dark' : 'light'}
                    onChangeText={(text) => Login.set_apple_username(text)}
                    onSubmitEditing={() => {
                      Login.register_apple_username()
                      Keyboard.dismiss()
                    }}
                    placeholder="Username"
                    placeholderTextColor={ink_soft}
                    returnKeyType="go"
                    selectionColor={accent}
                    style={[styles.input, { color: ink }]}
                    textContentType="username"
                    underlineColorAndroid="transparent"
                    value={Login.apple_username}
                  />
                </View>

                <PrimaryButton
                  accent={accent}
                  disabled={!Login.can_submit_apple_username()}
                  is_dark={is_dark}
                  is_loading={Login.is_loading}
                  label={Login.is_loading ? 'Creating account...' : 'Register'}
                  onPress={() => {
                    Login.register_apple_username()
                    Keyboard.dismiss()
                  }}
                  paper={paper}
                />

                {
                  Login.is_loading &&
                  <ActivityIndicator
                    animating={Login.is_loading}
                    color={accent}
                    style={styles.loading}
                  />
                }

                <Text style={[styles.footerNote, { color: ink_soft }]}>
                  Micro.blog will create a new hosted microblog for you to try. You can also use Micro.blog for free with an existing blog.
                </Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    )
  }
}

function PrimaryButton({
  accent,
  disabled = false,
  is_dark = false,
  is_loading = false,
  label,
  onPress,
  paper,
}) {
  const scale = useSharedValue(1)

  const animated_style = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    }
  }, [])

  function handle_press_in() {
    if (disabled) {
      return
    }
    scale.value = withSpring(0.985, {
      damping: 18,
      stiffness: 240,
    })
  }

  function handle_press_out() {
    if (disabled) {
      return
    }
    scale.value = withSpring(1, {
      damping: 16,
      stiffness: 220,
    })
  }

  return (
    <Animated.View style={animated_style}>
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
        onPressIn={handle_press_in}
        onPressOut={handle_press_out}
        style={({ pressed }) => [
          styles.primaryButton,
          {
            backgroundColor: disabled ? (is_dark ? '#2d2115' : '#fff3d2') : accent,
            borderColor: disabled ? (is_dark ? 'rgba(255,136,0,0.15)' : 'rgba(255,136,0,0.18)') : 'transparent',
            borderWidth: disabled ? 1 : 0,
            opacity: pressed && !disabled ? 0.96 : 1,
          },
        ]}
      >
        {is_loading ? (
          <ActivityIndicator color={paper} size="small" />
        ) : null}
        <Text
          style={[
            styles.primaryButtonLabel,
            {
              color: disabled ? (is_dark ? '#d9c0a8' : '#756657') : '#ffffff',
            },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  body: {
    fontSize: 17,
    lineHeight: 25,
    maxWidth: 340,
  },
  content: {
    flexGrow: 1,
    gap: 28,
    justifyContent: 'center',
    paddingBottom: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  flex: {
    flex: 1,
  },
  footerNote: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    textAlign: 'center',
  },
  form: {
    gap: 14,
  },
  heroCopy: {
    gap: 12,
  },
  input: {
    fontSize: 17,
    height: 52,
    lineHeight: 22,
    paddingVertical: 0,
  },
  inputWrap: {
    borderCurve: 'continuous',
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  kicker: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
  },
  loading: {
    marginTop: 4,
  },
  primaryButton: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 22,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 16,
  },
  primaryButtonLabel: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
  },
  safeArea: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
    maxWidth: 360,
  },
})
