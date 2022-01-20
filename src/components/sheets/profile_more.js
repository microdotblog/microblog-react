import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import BlockIcon from './../../assets/icons/block.png';
import ReportIcon from './../../assets/icons/report.png';
import Reporting from '../../stores/Reporting'
import Auth from '../../stores/Auth';

@observer
export default class ProfileMoreMenu extends React.Component{
  
  render() {
    if (Auth.selected_user == null) { return null; }
    return(
      <View
        style={{
          padding: 15,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 16
        }}
      >
        <Text style={{ fontWeight: '800', marginBottom: 25 }}>More...</Text>
        {
          Auth.selected_user.muting?.is_muted(this.props.username) ?
            <TouchableOpacity
              onPress={() => Auth.selected_user.muting?.unmute_user(this.props.username)}
              style={{ 
                padding: 8,
                paddingHorizontal: 16,
                borderRadius: 20,
                backgroundColor: "#F9FAFB",
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Image source={BlockIcon} style={{ marginRight: 8, height: 24, width: 24 }} />
              {
                Auth.selected_user.muting?.is_sending_unmute ?
                  <ActivityIndicator size="small" color="#1F2937" />
                  :
                  <Text style={{ fontSize: 16, fontWeight: '500', color: '#1F2937' }}>Unmute @{ this.props.username }</Text>
              }
            </TouchableOpacity>
            :
            <TouchableOpacity
              onPress={() => Auth.selected_user.muting?.mute_user(this.props.username)}
              style={{ 
                padding: 8,
                paddingHorizontal: 16,
                borderRadius: 20,
                backgroundColor: "#F9FAFB",
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Image source={BlockIcon} style={{ marginRight: 8, height: 24, width: 24 }} />
              {
                Auth.selected_user.muting?.is_sending_mute ?
                  <ActivityIndicator size="small" color="#1F2937" />
                  :
                  <Text style={{ fontSize: 16, fontWeight: '500', color: '#1F2937' }}>Mute @{ this.props.username }</Text>
              }
            </TouchableOpacity>
        }
        
        <TouchableOpacity
          disabled={Reporting.is_sending_report}
          onPress={() => Reporting.report_user(this.props.username)}
          style={{ 
            padding: 8,
            paddingHorizontal: 16,
            borderRadius: 20,
            backgroundColor: "#F87171",
            marginBottom: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Image source={ReportIcon} style={{ marginRight: 8, height: 24, width: 24 }} />
          {
            Reporting.is_sending_report ?
              <ActivityIndicator size="small" color="#fff" />
              :
              <Text style={{ fontSize: 16, fontWeight: '500', color: 'white' }}>Report @{ this.props.username }</Text>
          }
        </TouchableOpacity>
      </View>
    )
  }
  
}