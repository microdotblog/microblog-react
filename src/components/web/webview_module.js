import * as React from 'react';
import { observer } from 'mobx-react';
import { RefreshControl } from "react-native"
import Auth from '../../stores/Auth';
import App from '../../stores/App';
import { ScrollView } from 'react-native-gesture-handler';
import WebView from 'react-native-webview'
import { Navigation } from "react-native-navigation";
import PushNotifications from '../push/push_notifications'
import WebLoadingViewModule from './loading_view'

@observer
export default class WebViewModule extends React.Component{

  constructor (props) {
    super(props)
    this.ref = React.createRef()
    this.state = {
      endpoint: this.props.endpoint,
      signin_endpoint: `hybrid/signin?token=${Auth.selected_user.token()}&redirect_to=${this.props.endpoint}`,
      is_pull_to_refresh_enabled: true,
      scroll_view_height: 0,
    }
    this.web_url = "https://micro.blog"
    Navigation.events().bindComponent(this, this.props.component_id)
  }

  componentDidAppear = () => {
    console.log("WebViewModule:componentDidAppear::", this.props.endpoint)
    App.set_current_web_view_ref(this.ref.current)
  }

  componentDidMount = () => {
    this.bottom_tab_selected_listener = Navigation.events().registerBottomTabSelectedListener(({ selectedTabIndex, unselectedTabIndex }) => {
      if (selectedTabIndex === unselectedTabIndex && App.current_screen_id === this.props.component_id) {
        this.ref.current?.injectJavaScript(`window.scrollTo({ top: 0, behavior: 'smooth' })`)
      }
    });
  }

  componentWillUnmount = () => {
    this.bottom_tab_selected_listener.remove()
  }
  
  on_refresh = () => {
    this.setState({
      scroll_view_height: 0
    })
    this.ref.current.reload()
  }

  return_url_options = () => {
    let url_options = this.props.endpoint.includes("#post_") ? "" : "show_actions=true"
    if (url_options && url_options !== "") {
      url_options = `?${url_options}&theme=${App.theme}`
    }
    else if(!this.props.endpoint.includes("#post_")) {
      url_options = `?theme=${App.theme}`
    }
    return url_options
  }

  render() {
    const { is_pull_to_refresh_enabled, scroll_view_height } = this.state
    return (
      <>
      <ScrollView
        overScrollMode={'always'}
        style={{ flex: 1, width: '100%', height: '100%' }}
        contentContainerStyle={{ flex: 1 }}  
        onLayout={(e) => this.setState({scroll_view_height: e.nativeEvent.layout.height})}
        refreshControl={
          <RefreshControl
            onRefresh={this.on_refresh}
            refreshing={false}
            enabled={is_pull_to_refresh_enabled}
          />
        }
      >
        <WebView
          ref={this.ref}
          source={{ uri: `${this.web_url}/${Auth.did_load_one_or_more_webviews ? this.props.endpoint : this.state.signin_endpoint}${this.return_url_options()}` }}
          containerStyle={{ flex: 1 }}
          startInLoadingState={true}
          pullToRefreshEnabled={false}
          onLoadEnd={Auth.set_did_load_one_or_more_webviews}
          onShouldStartLoadWithRequest={(event) => {
            if(event.url.indexOf(this.props.endpoint) <= -1){
              App.handle_url_from_webview(event.url)
              return false
            }
            return true
          }}
          onScroll={(e) =>{
            this.setState({
              is_pull_to_refresh_enabled: typeof this.on_refresh === 'function' && e.nativeEvent.contentOffset.y <= 0.15
            })
            App.set_is_scrolling()
          }}
          onMessage={(event) => {
            App.handle_web_view_message(event.nativeEvent.data)
          }}
          style={{ flex: 1, height: scroll_view_height }}
          renderLoading={() => <WebLoadingViewModule />}  
        />
      </ScrollView>
      <PushNotifications />
      </>
    )
  }

}
