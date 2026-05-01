import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, FlatList, RefreshControl, Platform } from 'react-native';
import Auth from './../../stores/Auth';
import LoginMessage from '../../components/info/login_message'
import App from '../../stores/App'
import Replies from '../../stores/Replies';
import ReplyCell from '../../components/cells/reply_cell';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import { tabBarScrollContentBottomPadding } from '../../utils/ui'

@observer
export default class RepliesScreen extends React.Component{

  constructor(props) {
    super(props)
    this.requested_replies_key = null
  }

  componentDidMount() {
    this._refresh_replies_if_needed()
  }

  componentDidUpdate() {
    this._refresh_replies_if_needed()
  }

  _replies_request_key = () => {
    return Auth.selected_user?.username || null
  }

  _refresh_replies_if_needed = () => {
    const request_key = this._replies_request_key()
    if (!Auth.is_logged_in() || Auth.is_selecting_user || !request_key) {
      return
    }

    if (request_key === this.requested_replies_key) {
      return
    }

    this.requested_replies_key = request_key
    Replies.hydrate()
  }

  _refresh_replies = () => {
    this.requested_replies_key = null
    this._refresh_replies_if_needed()
  }
  
  _return_header = () => {
    return(
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 15,
          paddingVertical: 10,
          width: '100%',
          minHeight: 50,
          backgroundColor: App.theme_input_background_color(),
        }}>
        <Text style={{color: App.theme_text_color()}}>Replies can be edited in the first 24 hours after posting.</Text>
      </View>
    )
  }
  
  _return_replies_list = () => {
    const replies = Replies.replies.slice()
    const list_key = `${this.requested_replies_key || "replies"}`
    return(
      <SafeAreaInsetsContext.Consumer>
        {insets => {
          const bottom_padding = tabBarScrollContentBottomPadding(insets?.bottom, 10)

          return (
            <FlatList
              key={list_key}
              data={replies}
              extraData={`${list_key}-${replies.length}-${Replies.is_loading}`}
              keyExtractor={reply => reply.id}
              renderItem={({ item }) => <ReplyCell reply={item} />}
              style={{
                backgroundColor: App.theme_background_color_secondary(),
                width: '100%',
                flex: 1
              }}
              contentContainerStyle={{ paddingBottom: bottom_padding }}
              scrollIndicatorInsets={Platform.OS === 'ios' ? { bottom: bottom_padding } : undefined}
              refreshControl={
                <RefreshControl
                  refreshing={Replies.is_loading}
                  onRefresh={this._refresh_replies}
                />
              }
            />
          )
        }}
      </SafeAreaInsetsContext.Consumer>
    )
  }
  
  render() {
    return(
      <View style={{ flex: 1, justifyContent: 'flex-start' }}>
        {
          Auth.is_logged_in() && !Auth.is_selecting_user ?
            <>
            {this._return_header()}
            {this._return_replies_list()}
            </>
          :
          <LoginMessage title="Replies" />
        }
      </View>
    )
  }
  
}
