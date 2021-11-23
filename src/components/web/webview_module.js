import * as React from 'react';
import { observer } from 'mobx-react';
import { RefreshControl } from "react-native"
import Auth from '../../stores/Auth';
import App from '../../stores/App';
import { ScrollView } from 'react-native-gesture-handler';
import WebView from 'react-native-webview'
import { Navigation } from "react-native-navigation";

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
  }

  componentDidMount = () => {
    this.bottom_tab_selected_listener = Navigation.events().registerBottomTabSelectedListener(({ selectedTabIndex, unselectedTabIndex }) => {
      if (selectedTabIndex === unselectedTabIndex && App.current_screen_id === this.props.component_id) {
        this.ref.current?.postMessage('scroll_to_top')
      }
    });
  }

  componentWillUnmount = () => {
    this.bottom_tab_selected_listener.remove()
  }
  
  on_refresh = () => this.ref.current.reload()

  render() {
    const { is_pull_to_refresh_enabled, scroll_view_height } = this.state
    return (
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
          source={{ uri: `https://micro.blog/${Auth.did_load_one_or_more_webviews ? this.props.endpoint : this.state.signin_endpoint}`}}
          containerStyle={{ flex: 1 }}
          startInLoadingState={true}
          onLoadEnd={Auth.set_did_load_one_or_more_webviews}
          onScroll={() => App.set_is_scrolling(this.ref.current.startUrl)}
          onShouldStartLoadWithRequest={(event) => {
            if(event.url.indexOf(this.props.endpoint) <= -1){
              App.handle_url_from_webview(event.url)
              return false
            }
            return true
          }}
          onScroll={(e) =>
            this.setState({ is_pull_to_refresh_enabled: typeof this.on_refresh === 'function' && e.nativeEvent.contentOffset.y <= 0.15 })
          }
          style={{flex: 1, height: scroll_view_height }}
        />
      </ScrollView>
    )
  }

}
