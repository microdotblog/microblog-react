import * as React from 'react'
import { observer } from 'mobx-react'
import { Platform, Text, TouchableOpacity, View } from 'react-native'
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import App from '../../stores/App'

export function defaultScheduleDate() {
  const date = new Date()
  date.setHours(date.getHours() + 1, 0, 0, 0)
  return date.toISOString()
}

@observer
export default class SchedulePicker extends React.Component {
  initial_date = new Date().toISOString()

  handleChange = (event, date) => {
    this.props.onChange(date.toISOString())
  }

  showAndroidPicker = mode => {
    DateTimePickerAndroid.open({
      value: new Date(this.props.value || this.initial_date),
      mode,
      minimumDate: this.props.minimumDate,
      onValueChange: this.handleChange
    })
  }

  render() {
    const { value, disabled, minimumDate } = this.props
    const date = new Date(value || this.initial_date)

    if (Platform.OS === 'ios') {
      return (
        <DateTimePicker
          value={date}
          mode="datetime"
          display="inline"
          minimumDate={minimumDate}
          disabled={disabled}
          themeVariant={App.is_dark_mode() ? 'dark' : 'light'}
          accentColor={App.theme_accent_color()}
          onValueChange={this.handleChange}
          style={{ alignSelf: 'center', width: '100%', maxWidth: 380 }}
        />
      )
    }

    return (
      <View style={{ gap: 12 }}>
        {['date', 'time'].map(mode => (
          <TouchableOpacity
            key={mode}
            disabled={disabled}
            onPress={() => this.showAndroidPicker(mode)}
            accessibilityRole="button"
            accessibilityLabel={mode === 'date' ? 'Scheduled date' : 'Scheduled time'}
            style={{ padding: 12, backgroundColor: App.theme_input_background_color(), borderRadius: 8 }}
          >
            <Text style={{ color: App.theme_text_color(), fontSize: 16 }}>
              {mode === 'date' ? date.toLocaleDateString() : date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )
  }
}
