import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import Auth from './../../stores/Auth';
import LoginMessage from '../../components/info/login_message'
import App from '../../stores/App'
import { Navigation } from 'react-native-navigation';
import Replies from '../../stores/Replies';

@observer
export default class RepliesScreen extends React.Component{
  
  constructor (props) {
    super(props)
    Navigation.events().bindComponent(this)
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
            refreshing={false}
            onRefresh={Replies.refresh}
          />
        }
      >
        {
          Replies.replies.map((reply) => {
            return(
              <TouchableOpacity
                key={reply.id}
                style={{
                  padding: 15,
                  borderColor: App.theme_alt_background_div_color(),
                  borderBottomWidth: .5
                }}
                onPress={reply.can_edit() ? reply.trigger_edit : () => App.handle_url_from_webview(reply.url)}
              >
                <Text style={{color: App.theme_text_color(), fontSize: 15}}>{reply.content_text}</Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 20
                  }}
                >
                  <TouchableOpacity onPress={() => App.handle_url_from_webview(reply.url)}>
                    <Text style={{color: "gray", fontSize: 12}}>{reply.relative_date()}</Text>
                  </TouchableOpacity>
                 <TouchableOpacity onPress={reply.trigger_delete} style={{flexDirection: 'row', alignItems: 'center'}}>
                   <Text style={{color: "rgb(239,68,68)", fontSize: 15}}>Delete...</Text>
                 </TouchableOpacity>
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