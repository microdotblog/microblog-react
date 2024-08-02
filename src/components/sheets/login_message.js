import ActionSheet from "react-native-actions-sheet";
import * as React from 'react';
import { observer } from 'mobx-react';
import { SafeAreaView, Text } from 'react-native';
import Login from './../../stores/Login';

@observer
export default class LoginMessageSheet extends React.Component {
  render() {
    return (
      <ActionSheet
        containerStyle={{
          backgroundColor: '#6EE7B7',
          padding: 15,
          paddingHorizontal: 12,
          borderRadius: 5,
          elevation: 2
        }}
        id={this.props.sheet_id}
      >
        <SafeAreaView style={{ justifyContent: "center", alignItems: "center" }}>
          <Text style={{ textAlign: "center", color: "#064E3B", fontWeight: "600", fontSize: 17, paddingVertical: 15 }}>{Login.message}</Text>
        </SafeAreaView>
      </ActionSheet>
    )
  }
}