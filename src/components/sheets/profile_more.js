import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import ActionSheet from "react-native-actions-sheet";
import BlockIcon from './../../assets/icons/block.png';
import ReportIcon from './../../assets/icons/report.png';
import Reporting from '../../stores/Reporting'
import Auth from '../../stores/Auth';
import App from '../../stores/App'

@observer
export default class ProfileMoreMenu extends React.Component{
  
  render() {
    if (Auth.selected_user == null) { return null; }
    return(
      <ActionSheet
        id={this.props.sheetId}
        useBottomSafeAreaPadding={true}
        gestureEnabled={true}
        containerStyle={{
          backgroundColor: App.theme_background_color_secondary()
        }}
      >
        <View
          style={{
            padding: 15,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 16
          }}
        >
          <Text style={{ fontWeight: '800', marginBottom: 25, color: App.theme_text_color() }}>Muting & Reporting</Text>
          <View style={{width: "100%", marginBottom: 15}}>
            <Text style={{ fontWeight: '700', marginBottom: 5, color: App.theme_text_color() }}>Muting</Text>
            <Text style={{ fontWeight: '400', marginBottom: 25, color: App.theme_text_color() }}>You can mute/unmute @{this.props.payload.username}. Posts and replies from @{this.props.payload.username} will be hidden in your timeline.</Text>
            {
              Auth.selected_user.muting?.is_muted(this.props.payload.username) ?
                <TouchableOpacity
                  onPress={() => Auth.selected_user.muting?.unmute_user(this.props.payload.username)}
                  style={{ 
                    padding: 8,
                    paddingHorizontal: 16,
                    borderRadius: 20,
                    backgroundColor: App.theme_button_background_color(),
                    marginBottom: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    alignSelf: 'flex-start',
                    borderColor: App.theme_section_background_color(),
                    borderWidth: 1
                  }}
                >
                  <Image source={BlockIcon} style={{ marginRight: 8, height: 24, width: 24 }} />
                  {
                    Auth.selected_user.muting?.is_sending_unmute ?
                      <ActivityIndicator size="small" color="#1F2937" />
                      :
                      <Text style={{ fontSize: 16, fontWeight: '500', color: '#1F2937' }}>Unmute @{ this.props.payload.username }</Text>
                  }
                </TouchableOpacity>
                :
                <TouchableOpacity
                  onPress={() => Auth.selected_user.muting?.mute_user(this.props.payload.username)}
                  style={{ 
                    padding: 8,
                    paddingHorizontal: 16,
                    borderRadius: 20,
                    backgroundColor: App.theme_button_background_color(),
                    marginBottom: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    alignSelf: 'flex-start',
                    borderColor: App.theme_section_background_color(),
                    borderWidth: 1
                  }}
                >
                  <Image source={BlockIcon} style={{ marginRight: 8, height: 24, width: 24 }} />
                  {
                    Auth.selected_user.muting?.is_sending_mute ?
                      <ActivityIndicator size="small" color="#1F2937" />
                      :
                      <Text style={{ fontSize: 16, fontWeight: '500', color: '#1F2937' }}>Mute @{ this.props.payload.username }</Text>
                  }
                </TouchableOpacity>
            }
          </View>
          <View style={{width: "100%", marginBottom: 25}}>
            <Text style={{ fontWeight: '700', marginBottom: 5, color: App.theme_text_color() }}>Reporting</Text>
            <TouchableOpacity style={{marginBottom: 25}} onPress={() => App.open_url(App.guidelines_url)}>
              <Text style={{ fontWeight: '400', color: App.theme_text_color() }}>When reporting, we'll look at this user's posts to determine if they violate our <Text style={{fontWeight: "600", color: App.theme_text_color(), textDecorationLine: "underline"}}>community guidelines</Text>.</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={Reporting.is_sending_report}
              onPress={() => Reporting.report_user(this.props.payload.username)}
              style={{ 
                padding: 8,
                paddingHorizontal: 16,
                borderRadius: 20,
                backgroundColor: "#F87171",
                marginBottom: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                alignSelf: 'flex-start'
              }}
            >
              <Image source={ReportIcon} style={{ marginRight: 8, height: 24, width: 24 }} />
              {
                Reporting.is_sending_report ?
                  <ActivityIndicator size="small" color="#fff" />
                  :
                  <Text style={{ fontSize: 16, fontWeight: '500', color: 'white' }}>Report @{ this.props.payload.username }</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </ActionSheet>
    )
  }
  
}