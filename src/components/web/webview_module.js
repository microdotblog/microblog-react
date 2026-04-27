import * as React from 'react'
import { observer } from 'mobx-react'
import { RefreshControl, Platform, View } from "react-native"
import { useFocusEffect } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Auth from '../../stores/Auth'
import App from '../../stores/App'
import { ScrollView } from 'react-native-gesture-handler'
import WebView from 'react-native-webview'
import WebErrorViewModule from './error_view'
import LoadingBanner from './loading_banner'
import {
  build_webview_source_uri,
  get_base_webview_path,
  is_signin_webview_path,
  is_webview_endpoint_url,
  should_attempt_webview_recovery,
} from '../../utils/webview_recovery'
import { liquidGlassWebViewBottomInset } from '../../utils/ui'

const WebViewModule = observer((props) => {
  const insets = useSafeAreaInsets()
  const webViewRef = React.useRef(null)
  const hasSetDidLoadRef = React.useRef(false)
  const hasAttemptedRecoveryRef = React.useRef(false)
  const [state, setState] = React.useState({
    opacity: 0.0,
    is_pull_to_refresh_enabled: true,
    is_loading: true,
    is_initial_load: true,
    loading_progress: 0,
  })

  const web_url = "https://micro.blog"
  const web_view_key = Platform.OS === 'android'
    ? `${props.endpoint}:${App.web_view_epoch}`
    : props.endpoint
  const source_uri = build_webview_source_uri({
    did_load_one_or_more_webviews: Auth.did_load_one_or_more_webviews,
    endpoint: props.endpoint,
    theme: App.theme,
    token: Auth.selected_user?.token?.() ?? '',
    web_url,
  })
  const web_view_bottom_padding = liquidGlassWebViewBottomInset(insets.bottom)
  const web_view_css_properties_javascript = `
    (() => {
      const bottom_padding = '${web_view_bottom_padding}px'
      const apply_bottom_padding = () => {
        document.documentElement.style.setProperty('--microblog-webview-bottom-padding', bottom_padding)

        if (document.body) {
          document.body.style.setProperty('padding-bottom', 'var(--microblog-webview-bottom-padding)')
        }
      }

      apply_bottom_padding()

      if (!document.body) {
        document.addEventListener('DOMContentLoaded', apply_bottom_padding, { once: true })
      }
    })()
    true
  `
  const web_view_injected_javascript = Platform.OS === 'ios' ? `
    const meta = document.createElement('meta')
    meta.setAttribute('content', 'width=width, initial-scale=${App.web_font_scale()}')
    meta.setAttribute('name', 'viewport')
    document.getElementsByTagName('head')[0].appendChild(meta)
    ${web_view_css_properties_javascript}
  ` : null

  useFocusEffect(
    React.useCallback(() => {
      App.set_current_web_view_ref(webViewRef.current)
    }, [])
  )

  React.useEffect(() => {
    App.set_current_web_view_ref(webViewRef.current)

    if (!Auth.did_load_one_or_more_webviews) {
      hasSetDidLoadRef.current = false
    }
  })

  React.useEffect(() => {
    hasAttemptedRecoveryRef.current = false
  }, [props.endpoint])

  React.useEffect(() => {
    if (Platform.OS === 'ios') {
      webViewRef.current?.injectJavaScript(web_view_css_properties_javascript)
    }
  }, [web_view_css_properties_javascript])

  const on_refresh = () => {
    setState(prevState => {
      if (!prevState.is_initial_load) {
        return { ...prevState, is_loading: true, opacity: 1.0 }
      }

      return prevState
    })
    webViewRef.current?.reload()
  }

  const trigger_android_webview_recovery = (url = '') => {
    if (Platform.OS !== 'android') {
      return false
    }

    if (!should_attempt_webview_recovery({
      did_load_one_or_more_webviews: Auth.did_load_one_or_more_webviews,
      has_attempted_recovery: hasAttemptedRecoveryRef.current,
      url,
    })) {
      return false
    }

    console.log("WebViewModule:trigger_android_webview_recovery", url)
    hasSetDidLoadRef.current = false
    hasAttemptedRecoveryRef.current = true
    Auth.invalidate_webview_bootstrap()
    App.bump_web_view_epoch()
    setState(prevState => ({
      ...prevState,
      is_loading: true,
      loading_progress: 0,
    }))

    return true
  }

  const onContentProcessDidTerminate = () => webViewRef.current?.reload()

  const _webview = () => {
    return (
      <WebView
        key={web_view_key}
        ref={webViewRef}
        source={{ uri: source_uri }}
        containerStyle={{ flex: 1 }}
        pullToRefreshEnabled={false}
        decelerationRate={0.998}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={{ flex: 1, backgroundColor: App.theme_background_color() }} />
        )}
        onLoadStart={() => {
          setState(prevState => {
            return {
              ...prevState,
              is_loading: true,
              loading_progress: 0,
            }
          })
        }}
        onLoadProgress={(event) => {
          try {
            if (event && event.nativeEvent && typeof event.nativeEvent.progress === 'number') {
              const progressValue = Math.max(0, Math.min(1, event.nativeEvent.progress))
              setState(prevState => {
                return { ...prevState, loading_progress: progressValue }
              })
            }
          } catch (error) {
            console.log("WebViewModule:onLoadProgress:error", error)
          }
        }}
        onLoadEnd={(event) => {
          const url = event?.nativeEvent?.url || ''
          const isSigninUrl = is_signin_webview_path(url)
          const isActualEndpoint = is_webview_endpoint_url({ endpoint: props.endpoint, url })

          setState(prevState => {
            if (isActualEndpoint && !isSigninUrl) {
              if (!hasSetDidLoadRef.current && !Auth.did_load_one_or_more_webviews) {
                Auth.set_did_load_one_or_more_webviews()
                hasSetDidLoadRef.current = true
              }

              hasAttemptedRecoveryRef.current = false

              const newState = {
                ...prevState,
                loading_progress: 1,
              }

              setTimeout(() => {
                setState(nextState => {
                  if (nextState.is_initial_load) {
                    if (App.theme == "light") {
                      return { ...nextState, opacity: 1.0, is_initial_load: false, is_loading: false }
                    }

                    setTimeout(() => {
                      setState(prev => ({ ...prev, opacity: 1.0, is_initial_load: false, is_loading: false }))
                    }, 200)

                    return { ...nextState, is_loading: false }
                  }

                  webViewRef.current?.injectJavaScript('window.scrollTo({ top: 0, behavior: "smooth" })')
                  return { ...nextState, is_loading: false }
                })
              }, 300)

              return newState
            }

            return prevState
          })
        }}
        nestedScrollEnabled={true}
        onShouldStartLoadWithRequest={(event) => {
          const url = event.url
          const urlBasePath = get_base_webview_path(url)
          const endpointBasePath = get_base_webview_path(props.endpoint)

          if (urlBasePath === 'hybrid/signin') {
            return true
          }

          if (urlBasePath === endpointBasePath) {
            return true
          }

          App.handle_url_from_webview(event.url)
          return false
        }}
        onScroll={(e) => {
          if (e.nativeEvent.contentOffset != null && e.nativeEvent.contentOffset.y != null) {
            const y = e.nativeEvent.contentOffset.y
            setState(prevState => ({ ...prevState, is_pull_to_refresh_enabled: y <= 0.15 }))
          }
          App.set_is_scrolling()
        }}
        onMessage={(event) => {
          App.handle_web_view_message(event.nativeEvent.data)
        }}
        onError={(event) => {
          trigger_android_webview_recovery(event?.nativeEvent?.url ?? source_uri)
        }}
        onHttpError={(event) => {
          trigger_android_webview_recovery(event?.nativeEvent?.url ?? source_uri)
        }}
        onRenderProcessGone={(event) => {
          console.log("WebViewModule:onRenderProcessGone", event?.nativeEvent)
          trigger_android_webview_recovery(event?.nativeEvent?.url ?? source_uri)
        }}
        style={{ flex: 1, backgroundColor: App.theme_background_color(), opacity: state.opacity }}
        renderError={(name, code, description) => <WebErrorViewModule error_name={description} />}
        injectedJavaScript={web_view_injected_javascript}
        injectedJavaScriptBeforeContentLoaded={Platform.OS === 'ios' ? web_view_css_properties_javascript : null}
        onContentProcessDidTerminate={onContentProcessDidTerminate}
      />
    )
  }

  const [profileHeaderHeight, setProfileHeaderHeight] = React.useState(0)
  const is_conversation = props.endpoint.includes("conversation")

  return (
    <>
      {!is_conversation && (
        <LoadingBanner
          visible={state.is_loading}
          loading_text={props.loading_text ?? "Loading posts..."}
          topOffset={props.profile != null ? profileHeaderHeight + (Platform.OS === "ios" ? 12 : 8) : (Platform.OS === "ios" ? 12 : 8)}
          progress={state.loading_progress}
        />
      )}
      <ScrollView
        overScrollMode={Platform.OS === 'ios' ? 'auto' : 'always'}
        style={{ flex: 1, width: '100%', height: '100%', backgroundColor: App.theme_background_color() }}
        contentContainerStyle={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            onRefresh={on_refresh}
            refreshing={false}
            enabled={state.is_pull_to_refresh_enabled}
          />
        }
      >
        {
          props.profile != null ?
            <View
              onLayout={(event) => {
                const { height } = event.nativeEvent.layout
                if (height > 0) {
                  setProfileHeaderHeight(height)
                }
              }}
            >
              {props.profile}
            </View>
          : null
        }
        {_webview()}
      </ScrollView>
    </>
  )
})

export default WebViewModule
