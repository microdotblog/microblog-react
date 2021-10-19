import * as React from 'react';
import { observer } from 'mobx-react';
import { TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import Auth from './../../stores/Auth';
import { RNNBottomSheet } from 'react-native-navigation-bottom-sheet';
import DevInfo from './../dev/info';

RNNBottomSheet.init();

@observer
export default class ProfileImage extends React.Component{
  
  renderContent = () => (
    <View
      style={{
        backgroundColor: 'white',
        height: 200,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
      }}
    >
      <DevInfo />
    </View>
  );
  
  render() {
    if(Auth.selected_user != null){
      return(
        <TouchableOpacity style={{ width: 40, height: 30 }}
          onPress={() =>
            RNNBottomSheet.openBottomSheet({
              renderContent: this.renderContent,
              snapPoints: [0, '20%', '40%', '70%'],
              initialSnapIndex: 2,
              borderRadius: 16,
              
            })
          }
        >
          <FastImage
            source={{
              uri: Auth.selected_user.avatar,
              priority: FastImage.priority.normal
            }}
            resizeMode={FastImage.resizeMode.contain}
            style={{ width: 30, height: 30, borderRadius: 50 }}
          />
        </TouchableOpacity>
      )
    }
    return null
  }
  
}