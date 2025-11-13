import * as React from 'react';
import { observer } from 'mobx-react';
import { RefreshControl, Platform } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import Auth from '../../stores/Auth';
import App from '../../stores/App';
import { ScrollView } from 'react-native-gesture-handler';
import WebView from 'react-native-webview';
import WebLoadingViewModule from './loading_view';
import WebErrorViewModule from './error_view';

const WebViewModule = observer((props) => {
  const webViewRef = React.useRef(null);
  const [state, setState] = React.useState({
    endpoint: props.endpoint,
    opacity: 0.0,
    is_pull_to_refresh_enabled: true
  });

  const web_url = "https://micro.blog";

  const signin_endpoint = React.useMemo(() => {
    if (Auth.selected_user?.token()) {
      return `hybrid/signin?token=${Auth.selected_user.token()}&redirect_to=${props.endpoint}&theme=${App.theme}&show_actions=true`
    }
    return null
  }, [Auth.selected_user?.username, props.endpoint, App.theme])

  React.useEffect(() => {
    if (Auth.selected_user) {
      setState(prevState => ({ ...prevState, opacity: 0.0 }))
      if (webViewRef.current && !Auth.did_load_one_or_more_webviews) {
        webViewRef.current.reload()
      }
    }
  }, [Auth.selected_user?.username])

  useFocusEffect(
    React.useCallback(() => {
      App.set_current_web_view_ref(webViewRef.current);
    }, [])
  );

  const on_refresh = () => {
    webViewRef.current?.reload();
  };

  const return_url_options = () => {
    let url_options = props.endpoint.includes("#post_") ? "" : "show_actions=true&fontsize=17";
    if (url_options && url_options !== "") {
      url_options = `${!props.is_search && !props.is_filtered ? "?" : "&"}${url_options}&theme=${App.theme}`;
    }
    else if(!props.endpoint.includes("#post_")) {
      url_options = `?theme=${App.theme}`;
    }
    return url_options;
  };

  const onContentProcessDidTerminate = () => webViewRef.current?.reload();

  const _webview = () => {
    const webview_uri = Auth.did_load_one_or_more_webviews && Auth.selected_user
      ? `${web_url}/${props.endpoint}${return_url_options()}`
      : signin_endpoint
        ? `${web_url}/${signin_endpoint}${return_url_options()}`
        : `${web_url}/${props.endpoint}${return_url_options()}`
    
    return (
      <WebView
        ref={webViewRef}
        key={`webview-${Auth.selected_user?.username || 'none'}-${props.endpoint}`}
        source={{ uri: webview_uri }}
        containerStyle={{ flex: 1 }}
        startInLoadingState={props.should_show_loading}
        pullToRefreshEnabled={false}
        decelerationRate={0.998}
        onLoadEnd={(event) => {
          Auth.set_did_load_one_or_more_webviews();
          if (App.theme == "light") {
            setState(prevState => ({ ...prevState, opacity: 1.0 }));
          }
          else {
            setTimeout(() => {
              setState(prevState => ({ ...prevState, opacity: 1.0 }));
            }, 200);
          }
        }}
        nestedScrollEnabled={true}
        onShouldStartLoadWithRequest={(event) => {
          if(event.url.indexOf(props.endpoint) <= -1){
            App.handle_url_from_webview(event.url);
            return false;
          }
          return true;
        }}
        onScroll={(e) => {
          if (e.nativeEvent.contentOffset != null && e.nativeEvent.contentOffset.y != null) {
            const y = e.nativeEvent.contentOffset.y
            setState(prevState => ({ ...prevState, is_pull_to_refresh_enabled: y <= 0.15 }));
          }
          App.set_is_scrolling();
        }}
        onMessage={(event) => {
          App.handle_web_view_message(event.nativeEvent.data);
        }}
        style={{ flex: 1, backgroundColor: App.theme_background_color(), opacity: state.opacity }}
        renderLoading={() => <WebLoadingViewModule loading_text={props.loading_text} />}
        renderError={(name, code, description) => <WebErrorViewModule error_name={description} />}
        injectedJavaScript={Platform.OS === 'ios' ? `const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=${App.web_font_scale()}'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta);` : null}
        onContentProcessDidTerminate={onContentProcessDidTerminate}
      />
    );
  };

  return (
    <>
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
          props.profile
          : null
        }
        {_webview()}
      </ScrollView>
    </>
  );
});

export default WebViewModule;
