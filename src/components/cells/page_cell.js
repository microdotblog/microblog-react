import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity } from 'react-native';
import App from '../../stores/App'
import FastImage from 'react-native-fast-image';
import { editPageScreen } from '../../screens';

@observer
export default class PostCell extends React.Component{
  
  _render_images = () => {
    const { page } = this.props
    const images = page.images_from_content().map((url) => {
      return(
        <FastImage
          key={url}
          source={{
            uri: url,
            priority: FastImage.priority.normal,
            cache: FastImage.cacheControl.web
          }}
          resizeMode={FastImage.resizeMode.cover}
          style={{ width: 80, height: 80, borderRadius: 5 }}
        />
      )
    })
    return(
      <View style={{marginTop: 12, flexDirection: "row", gap: 5, flexWrap: "wrap"}}>
        {images}
      </View>
    )
  }
  
  render() {
    const { page } = this.props
    return(
      <TouchableOpacity
        style={{
          padding: 15,
          borderColor: App.theme_alt_background_div_color(),
          borderBottomWidth: .5,
          backgroundColor: App.theme_background_color_secondary()
        }}
        onPress={() => editPageScreen(page)}
      >
        {
          page.name &&
          <Text style={{color: App.theme_text_color(), fontSize: App.theme_default_font_size(), fontWeight: "700", marginBottom: 15}}>{page.name}</Text>
        }
        <Text style={{color: App.theme_text_color(), fontSize: App.theme_default_font_size()}}>{page.plain_text_content()}</Text>
        { page.images_from_content()?.length > 0 && this._render_images() }
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 20
          }}
        >
          <TouchableOpacity onPress={() => App.handle_url_from_webview(page.url)}>
            <Text style={{color: "gray", fontSize: 12}}>
            {page.nice_local_published_date()}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }
  
}