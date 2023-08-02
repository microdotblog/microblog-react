import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity } from 'react-native';
import App from '../../stores/App'
import { editPageScreen } from '../../screens';

@observer
export default class PostCell extends React.Component{
  
  render() {
    const { highlight } = this.props
    return(
      <TouchableOpacity
        style={{
          padding: 15,
          borderColor: App.theme_alt_background_div_color(),
          borderBottomWidth: .5,
          backgroundColor: App.theme_background_color_secondary()
        }}
        //onPress={() => editPageScreen(page)}
      >
        {
          highlight.title &&
          <Text style={{color: App.theme_text_color(), fontSize: 16, fontWeight: "700", marginBottom: 15}}>{highlight.title}</Text>
        }
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 20
          }}
        >
          <TouchableOpacity onPress={() => App.handle_url_from_webview(highlight.url)}>
            <Text style={{color: "gray", fontSize: 12}}>
            {highlight.nice_local_published_date()}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }
  
}