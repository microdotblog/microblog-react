import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import Auth from './../../stores/Auth';
import WebViewModule from '../../components/web/webview_module'
import LoginMessage from '../../components/info/login_message'
import ImageModalModule from '../../components/images/image_modal'
import App from '../../stores/App'

@observer
export default class RepliesScreen extends React.Component{
  
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
          backgroundColor: App.theme_input_background_color(),
        }}>
        <Text style={{color: App.theme_text_color()}}>Replies can be edited in the first 24 hours after posting.</Text>
      </View>
    )
  }
  
  _return_replies_list = () => {
    return(
      <ScrollView 
        style={{
          backgroundColor: App.theme_background_color_secondary()
        }}
        refreshControl={
          <RefreshControl
            refreshing={Auth.selected_user.replies.is_loading}
            onRefresh={Auth.selected_user.replies.refresh}
            tintColor={App.theme_accent_color()}
            progressBackgroundColor={App.theme_accent_color()}
          />
        }
      >
        {
          Auth.selected_user.replies.replies.map((reply) => {
            return(
              <TouchableOpacity
                key={reply.url}
                style={{
                  padding: 15,
                  borderColor: App.theme_alt_background_div_color(),
                  borderBottomWidth: .5
                }}
              >
                <Text style={{marginBottom: 20, color: App.theme_text_color(), fontSize: 15}}>{reply.content_text}</Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between"
                  }}
                >
                  <TouchableOpacity onPress={() => App.handle_url_from_webview(reply.url)}>
                    <Text style={{color: "gray", fontSize: 12}}>{reply.relative_date()}</Text>
                  </TouchableOpacity>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <TouchableOpacity style={{marginRight: 10}}>
                      <Text>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Text>Delete...</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )
          })
        }
      </ScrollView>
    )
  }
  
  render() {
    return(
      <View style={{ flex: 1, alignItems: 'center' }}>
        {
          Auth.is_logged_in() && !Auth.is_selecting_user && !App.should_reload_web_view() ?
            <>
            {this._return_header()}
            {this._return_replies_list()}
            </>
          :
          <LoginMessage title="Replies" />
        }
        <ImageModalModule />
      </View>
    )
  }
  
}