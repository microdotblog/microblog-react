import * as React from 'react'
import { observer } from 'mobx-react'
import { Button, Keyboard, Platform, Pressable, Text } from 'react-native'
import App from './../../stores/App'
import Auth from '../../stores/Auth'
import { HEADER_BUTTON_HIT_SLOP, isLiquidGlass } from './../../utils/ui'
import LiquidGlassButton from '../share/liquid_glass_button'

@observer
export default class PostButton extends React.Component {

  render() {
    const { posting } = Auth.selected_user
    const title = posting.is_scheduled() ? "Schedule" : posting.post_status === "draft" ? "Save" : "Post"
    const handle_press = async () => {
      Keyboard.dismiss()
      const sent = await posting.send_post()
      if (sent) {
        App.go_back()
      }
    }

    if (isLiquidGlass()) {
      return (
        <LiquidGlassButton
          style={{ width: title === "Schedule" ? 100 : 72, height: 36 }}
          title={title}
          variant="prominent"
          foregroundColor="#fff"
          baseBackgroundColor={App.theme_accent_color()}
          buttonAccessibilityLabel={title}
          disabled={posting.is_sending_post}
          onPress={handle_press}
        />
      )
    }

    if (Platform.OS === 'ios') {
      return (
        <Pressable
          disabled={posting.is_sending_post}
          onPress={handle_press}
          style={{
            minWidth: 44,
            height: 44,
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

    return <Button title={title} color={App.theme_accent_color()} disabled={posting.is_sending_post} onPress={handle_press} />
  }

}
