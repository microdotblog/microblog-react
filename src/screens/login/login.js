import * as React from 'react'
import { observer } from 'mobx-react'
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Modal,
  KeyboardAvoidingView as RNKeyboardAvoidingView,
} from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { appleAuth } from '@invertase/react-native-apple-authentication'
import { SFSymbol } from 'react-native-sfsymbols'
import Animated, {
  Easing,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import Login from './../../stores/Login'
import App from '../../stores/App'
import Auth from '../../stores/Auth'
import AuthBackground from '../../components/auth/AuthBackground'

const APP_ICON = require('../../assets/app_icon.png')
const MICRO_BLOG_LOGO = require('../../assets/mb_logo.png')
const MICRO_BLOG_ORANGE = '#ff8800'
const FOOTER_ENTRANCE_DELAY_MS = 420

@observer
export default class LoginScreen extends React.Component {
  apple_credential_revoked_unsubscribe = null
  did_request_dismiss = false
  state = {
    is_token_modal_visible: false,
    token_value: '',
  }

  componentDidMount() {
    if (Platform.OS === 'ios' && appleAuth.isSupported) {
      this.apple_credential_revoked_unsubscribe = appleAuth.onCredentialRevoked(async () => {
        console.warn('Apple credentials revoked')
      })
    }
    this.dismiss_if_login_finished()
  }

  componentDidUpdate() {
    this.dismiss_if_login_finished()
  }

  componentWillUnmount() {
    if (this.apple_credential_revoked_unsubscribe != null) {
      this.apple_credential_revoked_unsubscribe()
      this.apple_credential_revoked_unsubscribe = null
    }
  }

  dismiss_if_login_finished() {
    const should_dismiss = !!(
      !this.did_request_dismiss &&
      Login.did_trigger_login_from_url &&
      !Login.is_loading &&
      !Login.show_error &&
      Auth.is_logged_in() &&
      !Auth.is_selecting_user
    )

    if (should_dismiss) {
      this.did_request_dismiss = true
      Login.reset()
      if (this.has_signed_in_tabs_route()) {
        App.reset_to_tabs()
      }
    }
  }

  has_signed_in_tabs_route() {
    const navigation = App.navigation()
    if (navigation == null) {
      return false
    }

    const state = navigation.getRootState?.() || navigation.getState?.()
    return !!state?.routes?.some(route => route.name === 'Tabs')
  }

  is_add_account_presentation() {
    return Auth.is_logged_in()
  }

  open_token_modal = () => {
    Login.clear_error()
    this.setState({
      is_token_modal_visible: true,
    })
  }

  close_token_modal = () => {
    if (Login.is_loading) {
      return
    }

    Login.clear_error()
    this.setState({
      is_token_modal_visible: false,
      token_value: '',
    })
  }

  handle_token_value_change = (value = '') => {
    this.setState({ token_value: value })
    if (Login.show_error) {
      Login.clear_error()
    }
  }

  handle_token_submit = async () => {
    const did_sign_in = await Login.login_with_token(false, this.state.token_value)

    if (did_sign_in) {
      this.setState({
        is_token_modal_visible: false,
        token_value: '',
      })
    }
  }

  on_apple_button_press = async () => {
    try {
      Login.reset_apple_credentials()
      const apple_auth_request_response = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL]
      })

      const credential_state = await appleAuth.getCredentialStateForUser(apple_auth_request_response.user)
      if (credential_state === appleAuth.State.AUTHORIZED) {
        const full_name = [
          apple_auth_request_response.fullName?.givenName,
          apple_auth_request_response.fullName?.familyName
        ].filter(name => name != null && name.length > 0).join(' ')

        await Login.login_with_apple_credentials({
          user_id: apple_auth_request_response.user,
          identity_token: apple_auth_request_response.identityToken,
          email: apple_auth_request_response.email,
          full_name
        })
      }
    }
    catch (error) {
      if (error?.code !== appleAuth.Error.CANCELED) {
        Alert.alert('Ooops', 'An error occured whilst trying to sign you in with Apple. Please try again.')
      }
    }
  }

  render() {
    const should_disable_controls = !!(
      Login.did_trigger_login_from_url &&
      !Login.is_loading &&
      !Login.show_error &&
      Auth.is_logged_in() &&
      !Auth.is_selecting_user
    )
    const is_add_account = this.is_add_account_presentation()
    const is_dark = App.is_dark_mode()
    const accent = MICRO_BLOG_ORANGE
    const ink = is_dark ? '#fff7e8' : '#24180d'
    const ink_soft = is_dark ? '#d9c0a8' : '#756657'
    const paper = is_dark ? '#21180f' : '#ffffff'
    const line = is_dark ? 'rgba(255, 136, 0, 0.22)' : 'rgba(255, 136, 0, 0.2)'
    const input_bg = is_dark ? '#1a120c' : '#fffaf0'
    const canvas = is_dark ? '#15100b' : '#fffaf0'
    const safe_edges = is_add_account ? ['bottom'] : ['top', 'bottom']
    const content_style = [
      styles.content,
      is_add_account ? styles.contentWithHeader : null,
    ]
    const footer_error_message = this.state.is_token_modal_visible ? null : (
      Login.show_error ? Login.error_message : null
    )
    const modal_error_message = this.state.is_token_modal_visible ? (
      Login.show_error ? Login.error_message : null
    ) : null

    return (
      <View
        pointerEvents={should_disable_controls ? 'none' : 'auto'}
        style={[styles.screen, { backgroundColor: canvas }]}
      >
        <AuthBackground />
        <SafeAreaView edges={safe_edges} style={styles.safeArea}>
          <ScrollView
            bounces={false}
            contentContainerStyle={content_style}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View entering={FadeInUp.duration(680)} style={styles.hero}>
              {
                !is_add_account &&
                <Image source={APP_ICON} style={styles.appIcon} />
              }
              <View style={styles.heroCopy}>
                <Text style={[styles.kicker, { color: accent }]}>
                  Micro.blog
                </Text>
                <Text style={[styles.title, { color: ink }]}>
                  {
                    is_add_account
                      ? 'Add another account'
                      : 'Your timeline, bookmarks, and conversations.'
                  }
                </Text>
                <Text style={[styles.body, { color: ink_soft }]}>
                  {
                    is_add_account
                      ? 'Sign in with Micro.blog to add an account.'
                      : 'Sign in with Micro.blog to get started.'
                  }
                </Text>
              </View>
            </Animated.View>

            <LoginFooter
              accent={accent}
              error_message={footer_error_message}
              ink={ink}
              ink_soft={ink_soft}
              is_dark={is_dark}
              on_apple_press={this.on_apple_button_press}
              on_long_press_sign_in={this.open_token_modal}
              on_press_sign_in={Login.sign_in_with_micro_blog}
              paper={paper}
            />
          </ScrollView>
        </SafeAreaView>

        <TokenSignInModal
          accent={accent}
          error_message={modal_error_message}
          ink={ink}
          ink_soft={ink_soft}
          input_bg={input_bg}
          is_dark={is_dark}
          is_signing_in={Login.is_loading}
          line={line}
          onCancel={this.close_token_modal}
          onChangeTokenValue={this.handle_token_value_change}
          onSubmit={this.handle_token_submit}
          paper={paper}
          token_value={this.state.token_value}
          visible={this.state.is_token_modal_visible}
        />
      </View>
    )
  }
}

const LoginFooter = observer(function LoginFooter({
  accent,
  error_message = null,
  ink,
  ink_soft,
  is_dark,
  on_apple_press,
  on_long_press_sign_in,
  on_press_sign_in,
  paper,
}) {
  const footer_opacity = useSharedValue(0)
  const footer_translate_y = useSharedValue(26)

  React.useEffect(() => {
    footer_opacity.value = withDelay(
      FOOTER_ENTRANCE_DELAY_MS,
      withTiming(1, {
        duration: 320,
        easing: Easing.out(Easing.cubic),
      }),
    )
    footer_translate_y.value = withDelay(
      FOOTER_ENTRANCE_DELAY_MS,
      withTiming(0, {
        duration: 360,
        easing: Easing.out(Easing.cubic),
      }),
    )
  }, [footer_opacity, footer_translate_y])

  const footer_animated_style = useAnimatedStyle(() => {
    return {
      opacity: footer_opacity.value,
      transform: [{ translateY: footer_translate_y.value }],
    }
  }, [])

  return (
    <Animated.View style={[styles.footer, footer_animated_style]}>
      {error_message ? (
        <Text selectable style={[styles.errorMessage, { color: accent }]}>
          {error_message}
        </Text>
      ) : null}

      <PrimaryButton
        accessibilityHint="Long press to sign in with an app token."
        accent={accent}
        disabled={Login.is_loading}
        is_dark={is_dark}
        is_loading={Login.is_loading}
        label={Login.is_loading ? 'Connecting to Micro.blog...' : 'Sign in with Micro.blog'}
        leading_icon_source={MICRO_BLOG_LOGO}
        onLongPress={on_long_press_sign_in}
        onPress={on_press_sign_in}
        paper={paper}
        variant="solid"
      />

      {
        Platform.OS === 'ios' && appleAuth.isSupported &&
        <AppleSignInButton
          disabled={Login.is_loading}
          is_dark={is_dark}
          onPress={() => { if (!Login.is_loading) { on_apple_press() } }}
        />
      }

      <View style={styles.legal}>
        <Text style={[styles.legalText, { color: ink_soft }]}>
          By using the app you accept our{' '}
        </Text>
        <TouchableOpacity onPress={() => App.open_url(App.terms_url)}>
          <Text style={[styles.legalLink, { color: ink }]}>terms of service</Text>
        </TouchableOpacity>
        <Text style={[styles.legalText, { color: ink_soft }]}>, </Text>
        <TouchableOpacity onPress={() => App.open_url(App.privacy_url)}>
          <Text style={[styles.legalLink, { color: ink }]}>privacy policy</Text>
        </TouchableOpacity>
        <Text style={[styles.legalText, { color: ink_soft }]}>, and </Text>
        <TouchableOpacity onPress={() => App.open_url(App.guidelines_url)}>
          <Text style={[styles.legalLink, { color: ink }]}>community guidelines</Text>
        </TouchableOpacity>
        <Text style={[styles.legalText, { color: ink_soft }]}>.</Text>
      </View>
    </Animated.View>
  )
})

function AppleSignInButton({
  disabled = false,
  is_dark = false,
  onPress,
}) {
  const scale = useSharedValue(1)
  const background_color = is_dark ? '#ffffff' : '#000000'
  const content_color = is_dark ? '#000000' : '#ffffff'

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
        accessibilityLabel="Sign in with Apple"
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
        onPressIn={handle_press_in}
        onPressOut={handle_press_out}
        style={({ pressed }) => [
          styles.primaryButton,
          styles.appleButton,
          {
            backgroundColor: background_color,
            opacity: disabled ? 0.55 : (pressed ? 0.96 : 1),
          },
        ]}
      >
        <View style={styles.primaryButtonIcon}>
          <SFSymbol
            color={content_color}
            name="applelogo"
            style={styles.primaryButtonLogo}
            weight="medium"
          />
        </View>
        <Text style={[styles.primaryButtonLabel, { color: content_color }]}>
          Sign in with Apple
        </Text>
      </Pressable>
    </Animated.View>
  )
}

function PrimaryButton({
  accessibilityHint = null,
  accent,
  disabled = false,
  is_dark = false,
  is_loading = false,
  label,
  leading_icon_source = null,
  onLongPress,
  onPress,
  paper,
  variant = 'solid',
}) {
  const scale = useSharedValue(1)
  const did_long_press_ref = React.useRef(false)
  const is_light = variant === 'light'
  const should_show_leading_icon = leading_icon_source != null
  const solid_orange = accent || MICRO_BLOG_ORANGE
  const label_color = disabled
    ? (is_dark ? '#d9c0a8' : '#756657')
    : (is_light ? (is_dark ? '#fff7e8' : '#24180d') : '#ffffff')
  const spinner_color = is_light ? solid_orange : '#ffffff'

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

    if (did_long_press_ref.current) {
      setTimeout(() => {
        did_long_press_ref.current = false
      }, 0)
    }
  }

  function handle_press(event) {
    if (disabled) {
      return
    }

    if (did_long_press_ref.current) {
      did_long_press_ref.current = false
      return
    }

    onPress?.(event)
  }

  function handle_long_press(event) {
    if (disabled || !onLongPress) {
      return
    }

    did_long_press_ref.current = true
    onLongPress(event)
  }

  return (
    <Animated.View style={animated_style}>
      <Pressable
        accessibilityHint={accessibilityHint}
        accessibilityLabel={label}
        accessibilityRole="button"
        disabled={disabled}
        onLongPress={onLongPress ? handle_long_press : undefined}
        onPress={handle_press}
        onPressIn={handle_press_in}
        onPressOut={handle_press_out}
        style={({ pressed }) => [
          styles.primaryButton,
          {
            backgroundColor: disabled
              ? (is_dark ? '#2d2115' : '#fff3d2')
              : (is_light ? (is_dark ? 'rgba(255, 136, 0, 0.22)' : '#fff1c6') : solid_orange),
            borderColor: is_light ? (is_dark ? 'rgba(255,136,0,0.22)' : 'rgba(255,136,0,0.2)') : 'transparent',
            borderWidth: is_light ? 1 : 0,
            opacity: pressed && !disabled ? 0.96 : 1,
          },
          !disabled && !is_light ? styles.primaryButtonSolidShadow : null,
        ]}
      >
        {should_show_leading_icon ? (
          <View style={styles.primaryButtonIcon}>
            {is_loading ? (
              <ActivityIndicator color={spinner_color} size="small" />
            ) : (
              <Image
                contentFit="contain"
                source={leading_icon_source}
                style={styles.primaryButtonLogo}
              />
            )}
          </View>
        ) : (
          is_loading ? <ActivityIndicator color={spinner_color} size="small" /> : null
        )}
        <Text
          style={[
            styles.primaryButtonLabel,
            {
              color: label_color,
            },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  )
}

function TokenSignInModal({
  accent,
  error_message = null,
  ink,
  ink_soft,
  input_bg,
  is_dark,
  is_signing_in = false,
  line,
  onCancel,
  onChangeTokenValue,
  onSubmit,
  paper,
  token_value = '',
  visible = false,
}) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onCancel}
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <RNKeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalRoot}
      >
        <Pressable
          accessibilityLabel="Dismiss sign-in dialog"
          accessibilityRole="button"
          disabled={is_signing_in}
          onPress={onCancel}
          style={styles.modalBackdrop}
        />

        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: paper,
              borderColor: line,
            },
          ]}
        >
          <Text style={[styles.modalTitle, { color: ink }]}>
            Sign in with a token
          </Text>
          <Text style={[styles.modalBody, { color: ink_soft }]}>
            Paste a Micro.blog app token from your account page.
          </Text>

          <View
            style={[
              styles.modalInputWrap,
              {
                backgroundColor: input_bg,
                borderColor: line,
              },
            ]}
          >
            <TextInput
              accessibilityLabel="Micro.blog app token"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus={visible}
              keyboardAppearance={is_dark ? 'dark' : 'light'}
              onChangeText={onChangeTokenValue}
              onSubmitEditing={onSubmit}
              placeholder="Micro.blog token"
              placeholderTextColor={ink_soft}
              returnKeyType="done"
              selectionColor={accent}
              style={[styles.modalInput, { color: ink }]}
              value={token_value}
            />
          </View>

          {error_message ? (
            <Text selectable style={[styles.modalError, { color: accent }]}>
              {error_message}
            </Text>
          ) : null}

          <View style={styles.modalActions}>
            <PrimaryButton
              accent={accent}
              disabled={is_signing_in}
              is_dark={is_dark}
              is_loading={is_signing_in}
              label={is_signing_in ? 'Checking token...' : 'Sign in with token'}
              onPress={onSubmit}
              paper={paper}
            />
            <Pressable
              accessibilityLabel="Cancel"
              accessibilityRole="button"
              disabled={is_signing_in}
              onPress={onCancel}
              style={({ pressed }) => [
                styles.modalCancelAction,
                pressed && !is_signing_in ? styles.pressed : null,
              ]}
            >
              <Text style={[styles.modalCancelText, { color: ink_soft }]}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </RNKeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  appIcon: {
    borderRadius: 22,
    height: 76,
    width: 76,
  },
  appleButton: {
    borderWidth: 0,
  },
  body: {
    fontSize: 17,
    lineHeight: 25,
    maxWidth: 340,
  },
  content: {
    flexGrow: 1,
    gap: 32,
    justifyContent: 'space-between',
    paddingBottom: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  contentWithHeader: {
    paddingTop: 12,
  },
  errorMessage: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  footer: {
    gap: 14,
    minHeight: 112,
    paddingBottom: 4,
  },
  hero: {
    gap: 22,
    paddingTop: 8,
  },
  heroCopy: {
    gap: 12,
  },
  kicker: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
  },
  legal: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 4,
  },
  legalLink: {
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  legalText: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
    textAlign: 'center',
  },
  modalActions: {
    gap: 10,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalBody: {
    fontSize: 16,
    lineHeight: 23,
  },
  modalCancelAction: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '700',
  },
  modalCard: {
    borderCurve: 'continuous',
    borderRadius: 26,
    borderWidth: 1,
    gap: 16,
    padding: 20,
  },
  modalError: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  modalInput: {
    fontSize: 16,
    height: 50,
    lineHeight: 22,
    paddingVertical: 0,
  },
  modalInputWrap: {
    borderCurve: 'continuous',
    borderRadius: 17,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalRoot: {
    backgroundColor: 'rgba(18, 13, 7, 0.2)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 31,
  },
  pressed: {
    opacity: 0.72,
  },
  primaryButton: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 22,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 16,
  },
  primaryButtonSolidShadow: {
    boxShadow: '0 10px 18px rgba(255, 136, 0, 0.28)',
  },
  primaryButtonIcon: {
    alignItems: 'center',
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  primaryButtonLabel: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
  },
  primaryButtonLogo: {
    height: 26,
    width: 26,
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
