import * as React from 'react'
import { observer } from 'mobx-react'
import { Button, Keyboard, Platform, Pressable, Text } from 'react-native'
import App from './../../stores/App'
import Auth from '../../stores/Auth'
import { HEADER_BUTTON_HIT_SLOP, isLiquidGlass } from './../../utils/ui'

@observer
export default class PostButton extends React.Component {

  wait(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }

  render() {
    const { post_status } = Auth.selected_user?.posting
    const title = post_status === "draft" ? "Save" : "Post"
    const handle_press = async () => {
      Keyboard.dismiss()
      const sent = await Auth.selected_user.posting.send_post()
      if (sent) {
        await this.wait(500)
        App.go_back()
      }
    }

    if (Platform.OS === 'ios') {
      return (
        <Pressable
          onPress={handle_press}
          style={{
            minWidth: 44,
            height: isLiquidGlass() ? 28 : 44,
            paddingHorizontal: 4,
            alignItems: 'center',
            justifyContent: 'center'
          }}
          hitSlop={HEADER_BUTTON_HIT_SLOP}
          accessibilityRole="button"
          accessibilityLabel={title}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.9}
            maxFontSizeMultiplier={1.3}
            style={{
              color: App.theme_accent_color(),
              fontSize: 17,
              fontWeight: '600'
            }}
          >
            {title}
          </Text>
        </Pressable>
      )
    }

    return <Button title={title} color={App.theme_accent_color()} onPress={handle_press} />
  }

}
