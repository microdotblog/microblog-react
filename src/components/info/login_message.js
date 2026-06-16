import * as React from 'react'
import { observer } from 'mobx-react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import App from '../../stores/App'
import { tabBarBottomInset } from '../../utils/ui'

@observer
export default class LoginMessage extends React.Component{

  containerStyle(insets) {
    return [
      styles.container,
      {
        paddingBottom: tabBarBottomInset(insets?.bottom)
      }
    ]
  }

  messageStyle() {
    return [
      styles.message,
      {
        color: App.theme_accent_color()
      }
    ]
  }
  
  render() {
    return(
      <SafeAreaInsetsContext.Consumer>
        {insets => (
          <View style={this.containerStyle(insets)}>
            <TouchableOpacity style={styles.button} onPress={() => App.navigate_to_screen("Login")}>
              <Text style={this.messageStyle()}>Please sign in to continue</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaInsetsContext.Consumer>
    )
  }
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  message: {
    fontWeight: '700'
  }
})
