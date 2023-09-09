import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import Auth from './../../stores/Auth';
import LoginMessage from '../../components/info/login_message'
import App from '../../stores/App'
import { Navigation } from 'react-native-navigation';
import Replies from '../../stores/Replies';
import ReplyCell from '../../components/cells/reply_cell';

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
        <Text style={{color: App.theme_text_color(), fontSize: App.theme_default_font_size()}}>Replies can be edited in the first 24 hours after posting.</Text>
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
            return <ReplyCell key={reply.id} reply={reply} />
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