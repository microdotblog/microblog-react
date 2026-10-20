import * as React from 'react'
import { StyleSheet, View } from 'react-native'
import { observer } from 'mobx-react'
import { SafeAreaView } from 'react-native-screens/experimental'

@observer
export default class HorizontalSafeAreaView extends React.Component {
  render() {
    return (
      <View style={[styles.container, this.props.style]}>
        <SafeAreaView edges={{ left: true, right: true }} style={styles.container}>
          <View style={styles.container}>
            {this.props.children}
          </View>
        </SafeAreaView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch'
  }
})
