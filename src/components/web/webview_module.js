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
    signin_endpoint: `hybrid/signin?token=${Auth.selected_user.token()}&redirect_to=${props.endpoint}&theme=${App.theme}&show_actions=true`,
    opacity: 0.0
  });

  const web_url = "https://micro.blog";

  useFocusEffect(
    React.useCallback(() => {
      App.set_current_web_view_ref(webViewRef.current);
    }, [])
  );

  const on_refresh = () => {
    setState(prevState => ({
      ...prevState
    }));
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
    return (
      <WebView
        ref={webViewRef}
        source={{ uri: `${web_url}/${Auth.did_load_one_or_more_webviews ? props.endpoint : state.signin_endpoint}${return_url_options()}` }}
        containerStyle={{ flex: 1 }}
        startInLoadingState={props.should_show_loading}
        pullToRefreshEnabled={false}
        decelerationRate="normal"
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
            enabled={true}
          />
        }
      >
        {_webview()}
      </ScrollView>
    </>
  );
});

export default WebViewModule;
