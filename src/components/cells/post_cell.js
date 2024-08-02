import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import App from '../../stores/App'
import Auth from '../../stores/Auth'
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { RectButton } from 'react-native-gesture-handler';
import { SvgXml } from 'react-native-svg';
import FastImage from 'react-native-fast-image';

@observer
export default class PostCell extends React.Component{
  
  constructor(props){
    super(props)
    this._swipeable = React.createRef()
  }
  
  _right_actions = (progress, item) => (
    <View style={{ flexDirection: "row" }}>
      { this.props.post.is_draft() ?
        <View>
          {
            this._return_action(
              'Publish',
              App.theme_button_background_color(),
              60,
              progress,
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M 29 4.53125 C 23.785156 4.53125 19.371094 7.652344 17.25 12.0625 C 16.121094 11.285156 14.8125 10.71875 13.34375 10.71875 C 9.617188 10.71875 6.644531 13.667969 6.4375 17.34375 C 2.710938 18.6875 0 22.164063 0 26.34375 C 0 31.671875 4.328125 36 9.65625 36 L 18 36 C 18.359375 36.003906 18.695313 35.816406 18.878906 35.503906 C 19.058594 35.191406 19.058594 34.808594 18.878906 34.496094 C 18.695313 34.183594 18.359375 33.996094 18 34 L 9.65625 34 C 5.40625 34 2 30.589844 2 26.34375 C 2 22.808594 4.382813 19.832031 7.625 18.9375 C 8.066406 18.808594 8.363281 18.394531 8.34375 17.9375 C 8.339844 17.796875 8.34375 17.726563 8.34375 17.71875 C 8.34375 14.941406 10.566406 12.71875 13.34375 12.71875 C 14.734375 12.71875 16 13.277344 16.90625 14.1875 C 17.144531 14.417969 17.484375 14.519531 17.808594 14.449219 C 18.136719 14.378906 18.40625 14.152344 18.53125 13.84375 C 20.105469 9.59375 24.191406 6.53125 29 6.53125 C 35.171875 6.53125 40.15625 11.519531 40.15625 17.6875 C 40.15625 18.144531 40.121094 18.59375 40.0625 19.0625 C 40.027344 19.34375 40.113281 19.625 40.296875 19.839844 C 40.480469 20.054688 40.75 20.179688 41.03125 20.1875 L 41.09375 20.1875 C 44.917969 20.1875 48 23.269531 48 27.09375 C 48 30.917969 44.917969 34 41.09375 34 L 32 34 C 31.640625 33.996094 31.304688 34.183594 31.121094 34.496094 C 30.941406 34.808594 30.941406 35.191406 31.121094 35.503906 C 31.304688 35.816406 31.640625 36.003906 32 36 L 41.09375 36 C 46 36 50 32 50 27.09375 C 50 22.542969 46.507813 18.925781 42.09375 18.40625 C 42.109375 18.164063 42.15625 17.9375 42.15625 17.6875 C 42.15625 10.4375 36.25 4.53125 29 4.53125 Z M 25 21.59375 L 24.28125 22.28125 L 19.28125 27.28125 C 18.882813 27.679688 18.882813 28.320313 19.28125 28.71875 C 19.679688 29.117188 20.320313 29.117188 20.71875 28.71875 L 24 25.4375 L 24 43 C 23.996094 43.359375 24.183594 43.695313 24.496094 43.878906 C 24.808594 44.058594 25.191406 44.058594 25.503906 43.878906 C 25.816406 43.695313 26.003906 43.359375 26 43 L 26 25.4375 L 29.28125 28.71875 C 29.679688 29.117188 30.320313 29.117188 30.71875 28.71875 C 31.117188 28.320313 31.117188 27.679688 30.71875 27.28125 L 25.71875 22.28125 Z"/></svg>`,
              item,
              App.theme_button_text_color()
            )
          }
        </View>
        : null }
      <View>
        {
          this._return_action(
            'Delete',
            "rgb(239,68,68)",
            60,
            progress,
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M 21 2 C 19.354545 2 18 3.3545455 18 5 L 18 7 L 10.154297 7 A 1.0001 1.0001 0 0 0 9.984375 6.9863281 A 1.0001 1.0001 0 0 0 9.8398438 7 L 8 7 A 1.0001 1.0001 0 1 0 8 9 L 9 9 L 9 45 C 9 46.645455 10.354545 48 12 48 L 38 48 C 39.645455 48 41 46.645455 41 45 L 41 9 L 42 9 A 1.0001 1.0001 0 1 0 42 7 L 40.167969 7 A 1.0001 1.0001 0 0 0 39.841797 7 L 32 7 L 32 5 C 32 3.3545455 30.645455 2 29 2 L 21 2 z M 21 4 L 29 4 C 29.554545 4 30 4.4454545 30 5 L 30 7 L 20 7 L 20 5 C 20 4.4454545 20.445455 4 21 4 z M 11 9 L 18.832031 9 A 1.0001 1.0001 0 0 0 19.158203 9 L 30.832031 9 A 1.0001 1.0001 0 0 0 31.158203 9 L 39 9 L 39 45 C 39 45.554545 38.554545 46 38 46 L 12 46 C 11.445455 46 11 45.554545 11 45 L 11 9 z M 18.984375 13.986328 A 1.0001 1.0001 0 0 0 18 15 L 18 40 A 1.0001 1.0001 0 1 0 20 40 L 20 15 A 1.0001 1.0001 0 0 0 18.984375 13.986328 z M 24.984375 13.986328 A 1.0001 1.0001 0 0 0 24 15 L 24 40 A 1.0001 1.0001 0 1 0 26 40 L 26 15 A 1.0001 1.0001 0 0 0 24.984375 13.986328 z M 30.984375 13.986328 A 1.0001 1.0001 0 0 0 30 15 L 30 40 A 1.0001 1.0001 0 1 0 32 40 L 32 15 A 1.0001 1.0001 0 0 0 30.984375 13.986328 z"/></svg>`,
            item
          )
        }
      </View>
    </View>
  )
  
  _trigger_publish = () => {
    Auth.selected_user.posting.selected_service?.publish_draft(this.props.post)
  }

  _trigger_delete = () => {
    Auth.selected_user.posting.selected_service?.trigger_post_delete(this.props.post)
  }
  
  _return_action = (text, color, x, progress, icon, item, stroke = "#fff") => {
    
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [x, 0],
    });
    
    const press_handler = () => {
      if (text === "Publish") {
        this._trigger_publish()
        this._swipeable?.current?.close()
      }
      else if (text === "Delete") {
        this._trigger_delete()
        this._swipeable?.current?.close()
      }
    };
  
    return (
      <Animated.View style={{ flex: 1, backgroundColor: color, transform: [{ translateX: trans }] }}>
        <RectButton
          style={{
            backgroundColor: color,
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
            padding: 5,
            paddingHorizontal: 15
          }}
          onPress={press_handler}>
          <SvgXml
            xml={icon}
            width={24}
            height={24}
            stroke={stroke}
          />
          <Text style={{ color: stroke, marginTop: 5, fontWeight: '600', textAlign: 'center' }}>{text}</Text>
        </RectButton>
      </Animated.View>
    );
  }
  
  _render_images = () => {
    const { post } = this.props
    const images = post.images_from_content().map((url) => {
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
    const { post } = this.props
    return(
      <Swipeable
        ref={this._swipeable}
        friction={1}
        overshootFriction={8}
        enableTrackpadTwoFingerGesture={true}
        renderRightActions={(progress) => this._right_actions(progress, post)}
      >
        <TouchableOpacity
          style={{
            padding: 15,
            borderColor: App.theme_alt_background_div_color(),
            borderBottomWidth: .5,
            backgroundColor: App.theme_background_color_secondary()
          }}
          onPress={() => App.navigate_to_screen("PostEdit", post)}
        >
          {
            post.name &&
            <Text style={{color: App.theme_text_color(), fontSize: App.theme_default_font_size(), fontWeight: "700", marginBottom: 15}}>{post.name}</Text>
          }
          <Text style={{color: App.theme_text_color(), fontSize: App.theme_default_font_size()}}>{post.plain_text_content()}</Text>
          { post.images_from_content()?.length > 0 && this._render_images() }
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 20
            }}
          >
            <TouchableOpacity onPress={() => App.handle_url_from_webview(post.url)}>
              <Text style={{color: "gray", fontSize: 12}}>{post.nice_local_published_date()}
                { post.is_draft() ? <Text> — draft</Text> : null }
              </Text>
            </TouchableOpacity>
            {
              Platform.OS === "android" &&
              <TouchableOpacity onPress={this._trigger_delete} style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{color: "rgb(239,68,68)", fontSize: 15}}>Delete...</Text>
              </TouchableOpacity>
            }
          </View>
        </TouchableOpacity>
      </Swipeable>
    )
  }
  
}