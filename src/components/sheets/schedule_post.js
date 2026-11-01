import * as React from 'react'
import { observer } from 'mobx-react'
import { ActivityIndicator, Button, ScrollView, Text, View } from 'react-native'
import ActionSheet, { SheetManager } from 'react-native-actions-sheet'
import SchedulePicker, { defaultScheduleDate } from '../posts/schedule_picker'
import App from '../../stores/App'

@observer
export default class SchedulePostSheet extends React.Component {
  state = {
    published: defaultScheduleDate(),
    is_saving: false
  }

  schedulePost = async () => {
    if (this.state.is_saving || Date.parse(this.state.published) <= Date.now()) {
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
    return (
      <ActionSheet
        id={this.props.sheetId}
        useBottomSafeAreaPadding={true}
        gestureEnabled={!is_saving}
        closable={!is_saving}
        containerStyle={{ backgroundColor: App.theme_background_color(), maxWidth: 420, alignSelf: 'center' }}
      >
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: App.theme_text_color(), marginBottom: 12 }}>
            Schedule Post
          </Text>
          <SchedulePicker
            value={published}
            onChange={value => this.setState({ published: value })}
            minimumDate={new Date()}
            disabled={is_saving}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <Button title="Cancel" disabled={is_saving} onPress={() => SheetManager.hide(this.props.sheetId)} color={App.theme_accent_color()} />
            {is_saving ? <ActivityIndicator color={App.theme_accent_color()} /> : (
              <Button title="Schedule" disabled={Date.parse(published) <= Date.now()} onPress={this.schedulePost} color={App.theme_accent_color()} />
            )}
          </View>
        </ScrollView>
      </ActionSheet>
    )
  }
}
