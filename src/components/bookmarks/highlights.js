import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity } from 'react-native';
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
            <Text>{Auth.selected_user?.bookmark_highlights?.length} highlights</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
  
}