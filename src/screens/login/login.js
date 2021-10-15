import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TextInput, Button, ActivityIndicator } from 'react-native';
import Login from './../../stores/Login';

@observer
export default class LoginScreen extends React.Component{
  
  render() {
    return(
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 5 }}>
        <Text style={{fontWeight: "700"}}>Enter your email address to sign in to Micro.blog:</Text>
        <TextInput
          placeholderTextColor="lightgrey"
          textContentType={'emailAddress'}
          placeholder={"Enter your email address"}
          returnKeyType={'go'}
          keyboardType={'email-address'}
          blurOnSubmit={true}
          autoFocus={false}
          autoCorrect={true}
          autoCapitalize="none"
          autoComplete={"email"}
          clearButtonMode={'while-editing'}
          enablesReturnKeyAutomatically={true}
          underlineColorAndroid={'transparent'}
          style={{ 
            backgroundColor: '#f2f2f2', 
            fontSize: 17,
            borderColor: `${!Login.show_error ? "#f80" : "#ea053b"}`, 
            borderWidth: 1,
            textAlign: 'center',
            height: 50,
            width: "95%",
            borderRadius: 5,
            marginVertical: 15
          }}
          onChangeText={(text) => Login.set_input_value(text)}
          onSubmitEditing={Login.trigger_login}
          value={Login.input_value}
        />
        <Button
          title="Continue"
          color="#f80"
          onPress={Login.trigger_login}
          disabled={!Login.can_submit()}
        />
        <ActivityIndicator 
          animating={Login.is_loading}
          style={{
            marginTop: 15
          }}
        />
        {
          Login.message !== null && Login.message !== "" ?
          <View>
            <Text>{Login.message}</Text>
          </View>
          : null
        }
      </View>
    )
  }
  
}