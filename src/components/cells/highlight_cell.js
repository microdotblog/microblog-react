import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity } from 'react-native';
import App from '../../stores/App'
import { postingScreen } from '../../screens';

@observer
export default class PostCell extends React.Component{
  
  render() {
    const { highlight } = this.props
    return(
      <TouchableOpacity
        style={{
          padding: 15,
          borderColor: App.theme_highlight_border_color(),
          borderBottomWidth: .5,
          backgroundColor: App.theme_highlight_background_color()
        }}
        onPress={() => postingScreen(highlight.markdown())}
      >
        {
          highlight.content_text && 
          <Text style={{color: "#000", fontSize: 15}}>{highlight.content_text}</Text>
        }
        {
          highlight.title &&
          <Text style={{color: App.theme_highlight_meta_text_color(), fontSize: 15, marginTop: 15}}>{highlight.hostname()}: {highlight.title}</Text>
        }
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 20
          }}
        >
          <TouchableOpacity onPress={() => App.handle_url_from_webview(highlight.url)}>
            <Text style={{color: App.theme_highlight_meta_text_color(), fontSize: 12}}>
            {highlight.nice_local_published_date()}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }
  
}