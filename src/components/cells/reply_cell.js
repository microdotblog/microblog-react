import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, Animated, Platform } from 'react-native';
import App from '../../stores/App'
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { RectButton } from 'react-native-gesture-handler';
import { SvgXml } from 'react-native-svg';

@observer
export default class ReplyCell extends React.Component{
  
  constructor(props){
    super(props)
    this._swipeable = React.createRef()
  }
  
  _right_actions = (progress, item) => (
    <View>
      {
        this._return_action(
          'Delete',
          "rgb(239,68,68)",
          60,
          progress,
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-delete"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>`,
          item
        )
      }
    </View>
  )
  
  _return_action = (text, color, x, progress, icon, item) => {
    
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [x, 0],
    });
    
    const press_handler = () => {
      if (text === "Delete") {
        item.trigger_delete()
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
            stroke={'#FFF'}
          />
          <Text style={{ color: 'white', marginTop: 5, fontWeight: '600', textAlign: 'center' }}>{text}</Text>
        </RectButton>
      </Animated.View>
    );
  }
  
  render() {
    const { reply } = this.props
    return(
      <Swipeable
        ref={this._swipeable}
        friction={1}
        overshootFriction={8}
        enableTrackpadTwoFingerGesture={true}
        renderRightActions={(progress) => this._right_actions(progress, reply)}
      >
        <TouchableOpacity
          style={{
            padding: 15,
            borderColor: App.theme_alt_background_div_color(),
            borderBottomWidth: .5,
            backgroundColor: App.theme_background_color_secondary()
          }}
          onPress={reply.can_edit() ? reply.trigger_edit : () => App.handle_url_from_webview(reply.url)}
        >
          <Text style={{color: App.theme_text_color(), fontSize: 15, opacity: reply.can_edit() ? 1 : .5}}>{reply.content_text}</Text>
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
            {
              Platform.OS === "android" &&
              <TouchableOpacity onPress={reply.trigger_delete} style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{color: "rgb(239,68,68)", fontSize: 15}}>Delete...</Text>
              </TouchableOpacity>
            }
          </View>
        </TouchableOpacity>
      </Swipeable>
    )
  }
  
}