import * as React from 'react';
import { observer } from 'mobx-react';
import { RefreshControl, Platform, View } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import Auth from '../../stores/Auth';
import App from '../../stores/App';
import { ScrollView } from 'react-native-gesture-handler';
import WebView from 'react-native-webview';
import WebErrorViewModule from './error_view';
import LoadingBanner from './loading_banner';

const WebViewModule = observer((props) => {
  const webViewRef = React.useRef(null);
  const [state, setState] = React.useState({
    endpoint: props.endpoint,
    signin_endpoint: `hybrid/signin?token=${Auth.selected_user.token()}&redirect_to=${props.endpoint}&theme=${App.theme}&show_actions=true`,
    opacity: 0.0,
    is_pull_to_refresh_enabled: true,
    is_loading: true,
    is_initial_load: true
  });

  const web_url = "https://micro.blog";

  useFocusEffect(
    React.useCallback(() => {
      App.set_current_web_view_ref(webViewRef.current);
    }, [])
  );

  const on_refresh = () => {
    setState(prevState => {
      if (!prevState.is_initial_load) {
        return { ...prevState, is_loading: true, opacity: 1.0 };
      }
      return prevState;
    });
    webViewRef.current?.injectJavaScript('window.location.reload();');
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
        pullToRefreshEnabled={false}
        decelerationRate={0.998}
        cacheEnabled={true}
        cacheMode="LOAD_CACHE_ELSE_NETWORK"
        onLoadStart={() => {
          setState(prevState => {
            return { ...prevState, is_loading: true };
          });
        }}
        onLoadEnd={(event) => {
          Auth.set_did_load_one_or_more_webviews();
          
          setState(prevState => {
            if (prevState.is_initial_load) {
              if (App.theme == "light") {
                return { ...prevState, opacity: 1.0, is_initial_load: false, is_loading: false };
              }
              else {
                setTimeout(() => {
                  setState(prev => ({ ...prev, opacity: 1.0, is_initial_load: false, is_loading: false }));
                }, 200);
                return { ...prevState, is_loading: false };
              }
            }
            else {
              webViewRef.current?.injectJavaScript('window.scrollTo({ top: 0, behavior: "smooth" })');
              return { ...prevState, is_loading: false };
            }
          });
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
        renderError={(name, code, description) => <WebErrorViewModule error_name={description} />}
        injectedJavaScript={Platform.OS === 'ios' ? `const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=${App.web_font_scale()}'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta);` : null}
        onContentProcessDidTerminate={onContentProcessDidTerminate}
      />
    );
  };

  const profileHeaderRef = React.useRef(null);
  const [profileHeaderHeight, setProfileHeaderHeight] = React.useState(0);

  return (
    <>
      <LoadingBanner 
        visible={state.is_loading} 
        loading_text={props.loading_text ?? "Loading posts..."}
        topOffset={props.profile != null ? profileHeaderHeight + (Platform.OS === "ios" ? 12 : 8) : (Platform.OS === "ios" ? 12 : 8)}
      />
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
            ref={profileHeaderRef}
            onLayout={(event) => {
              const { height } = event.nativeEvent.layout;
              if (height > 0) {
                setProfileHeaderHeight(height);
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
  );
});

export default WebViewModule;
