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

  handleChange = (mode, date) => {
    const selected_date = new Date(this.props.value || this.initial_date)
    if (mode === 'date') {
      selected_date.setFullYear(date.getFullYear(), date.getMonth(), date.getDate())
    }
    else {
      selected_date.setHours(date.getHours(), date.getMinutes(), 0, 0)
    }
    this.props.onChange(selected_date.toISOString())
  }

  showAndroidPicker = mode => {
    DateTimePickerAndroid.open({
      value: new Date(this.props.value || this.initial_date),
      mode,
      minimumDate: this.props.minimumDate,
      onValueChange: (event, date) => this.handleChange(mode, date)
    })
  }

  render() {
    const { value, disabled, minimumDate } = this.props
    const date = new Date(value || this.initial_date)

    if (Platform.OS === 'ios') {
      return (
        <View style={{ alignSelf: 'center', maxWidth: '100%' }}>
          <DateTimePicker
            value={date}
            mode="date"
            display="inline"
            minimumDate={minimumDate}
            disabled={disabled}
            themeVariant={App.is_dark_mode() ? 'dark' : 'light'}
            accentColor={App.theme_accent_color()}
            onValueChange={(event, selected_date) => this.handleChange('date', selected_date)}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, marginTop: 24, marginBottom: 8 }}>
            <Text style={{ fontSize: 17, fontWeight: '600', color: App.theme_text_color() }}>Time</Text>
            <DateTimePicker
              value={date}
              mode="time"
              display="compact"
              disabled={disabled}
              themeVariant={App.is_dark_mode() ? 'dark' : 'light'}
              accentColor={App.theme_accent_color()}
              onValueChange={(event, selected_date) => this.handleChange('time', selected_date)}
            />
          </View>
        </View>
      )
    }

    return (
      <View style={{ gap: 24 }}>
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
