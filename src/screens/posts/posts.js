import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import Auth from './../../stores/Auth';
import LoginMessage from '../../components/info/login_message'
import App from '../../stores/App'
import { Navigation } from 'react-native-navigation';

@observer
export default class PostsScreen extends React.Component{
  
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
  
  render() {
    return(
      <View style={{ flex: 1, alignItems: 'center' }}>
        {
          Auth.is_logged_in() && !Auth.is_selecting_user ?
            <>
            {this._return_header()}
            </>
          :
          <LoginMessage title="Posts" />
        }
      </View>
    )
  }
  
}