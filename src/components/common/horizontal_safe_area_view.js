import * as React from 'react'
import { StyleSheet, View } from 'react-native'
import { observer } from 'mobx-react'
import { SafeAreaView } from 'react-native-screens/experimental'

@observer
export default class HorizontalSafeAreaView extends React.Component {
  render() {
    return (
      <SafeAreaView edges={{ left: true, right: true }} style={[styles.container, this.props.style]}>
        <View style={styles.container}>
          {this.props.children}
        </View>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch'
  }
})
