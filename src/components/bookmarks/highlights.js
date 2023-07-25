import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import App from './../../stores/App';
import Auth from '../../stores/Auth';
import { } from './../../screens/'

@observer
export default class HighlightsHeader extends React.Component{
  
  render() {
    return(
      <View style={{ padding: 12, backgroundColor: App.theme_button_background_color(), width: '100%' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity>
            <Text style={{ color: App.theme_text_color(), fontSize: 18 }}>{Auth.selected_user?.bookmark_highlights?.length} {Auth.selected_user?.bookmark_highlights?.length > 1 ? "highlights" : "highlight"}</Text>
          </TouchableOpacity>
          {
            App.is_loading_highlights &&
            <ActivityIndicator color="#f80" style={{marginLeft: 8}} />
          }
        </View>
      </View>
    )
  }
  
}