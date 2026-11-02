import * as React from 'react'
import { observer } from 'mobx-react'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import ActionSheet, { SheetManager } from 'react-native-actions-sheet'
import SchedulePicker, { defaultScheduleDate } from '../posts/schedule_picker'
import App from '../../stores/App'

@observer
export default class SchedulePostSheet extends React.Component {
  initial_published = defaultScheduleDate()

  state = {
    published: this.initial_published,
    is_saving: false
  }

  schedulePost = async () => {
    if (this.state.is_saving || this.state.published === this.initial_published || Date.parse(this.state.published) <= Date.now()) {
      return
    }
    this.setState({ is_saving: true })
    try {
      const { service, post } = this.props.payload
      const scheduled = await service.schedule_post(post, this.state.published)
      if (scheduled) {
        await SheetManager.hide(this.props.sheetId)
      }
    }
    finally {
      this.setState({ is_saving: false })
    }
  }

  render() {
    const { published, is_saving } = this.state
    const is_disabled = is_saving || published === this.initial_published || Date.parse(published) <= Date.now()
    const disabled_text_color = App.is_dark_mode() ? App.theme_button_disabled_text_color() : 'lightgray'
    return (
      <ActionSheet
        id={this.props.sheetId}
        useBottomSafeAreaPadding={true}
        gestureEnabled={!is_saving}
        headerAlwaysVisible={true}
        closable={!is_saving}
        closeOnTouchBackdrop={!is_saving}
        containerStyle={{ backgroundColor: App.theme_background_color(), maxWidth: 420, alignSelf: 'center' }}
      >
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 }}>
            <ActivityIndicator animating={is_saving} hidesWhenStopped={true} style={{ marginRight: 10 }} />
            <TouchableOpacity
              disabled={is_disabled}
              onPress={this.schedulePost}
              accessibilityRole="button"
              accessibilityState={{ disabled: is_disabled }}
              style={{
                padding: 8,
                paddingHorizontal: 15,
                backgroundColor: is_disabled ? App.theme_button_disabled_background_color() : App.theme_button_background_color(),
                borderRadius: 20,
                borderColor: is_disabled ? `${App.theme_section_background_color()}80` : App.theme_section_background_color(),
                borderWidth: 1,
                opacity: is_disabled ? 0.5 : 1
              }}
            >
              <Text style={{ color: is_disabled ? disabled_text_color : App.theme_button_text_color() }}>Schedule</Text>
            </TouchableOpacity>
          </View>
          <SchedulePicker
            value={published}
            onChange={value => this.setState({ published: value })}
            minimumDate={new Date()}
            disabled={is_saving}
          />
        </ScrollView>
      </ActionSheet>
    )
  }
}
