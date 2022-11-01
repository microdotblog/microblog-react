import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import Auth from './../../stores/Auth';
import LoginMessage from '../../components/info/login_message'
import ImageModalModule from '../../components/images/image_modal'
import App from '../../stores/App'
import { replyEditScreen  } from '../../screens';
import { SvgXml } from 'react-native-svg';

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
          />
        }
      >
        {
          Auth.selected_user.replies.replies.map((reply) => {
            return(
              <TouchableOpacity
                key={reply.id}
                style={{
                  padding: 15,
                  borderColor: App.theme_alt_background_div_color(),
                  borderBottomWidth: .5
                }}
                onPress={reply.can_edit() ? () => replyEditScreen(reply) : () => App.handle_url_from_webview(reply.url)}
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
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    {
                      reply.can_edit() &&
                      <TouchableOpacity style={{marginRight: 15, flexDirection: 'row', alignItems: 'center'}} onPress={() => replyEditScreen(reply)}>
                        <SvgXml
                          xml={`
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" strokeWidth=".85" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                            </svg>
                          `}
                          width={14}
                          height={14}
                          style={{marginRight: 4}}
                          stroke={App.theme_button_text_color()}
                          fill={"transparent"}
                        />
                        <Text style={{color: App.theme_button_text_color(), fontSize: 15}}>
                          Edit
                        </Text>
                      </TouchableOpacity>
                    }
                    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text style={{color: "red", fontSize: 15}}>Delete...</Text>
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