import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import Auth from '../../stores/Auth';
import BlockIcon from '../../assets/icons/block.png';

@observer
export default class MutedMessage extends React.Component{
  
  render() {
    return(
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {
          this.props.title ?
            <Text style={{ fontWeight: '600', fontSize: 18, marginBottom: 15 }}>{this.props.title}</Text>
          : null
        }
        <TouchableOpacity
					onPress={() => Auth.selected_user.muting?.unmute_user(this.props.username)}
					style={{ 
						padding: 8,
						paddingHorizontal: 16,
						borderRadius: 20,
						backgroundColor: "#E5E7EB",
						marginTop: 12,
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
      </View>
    )
  }
  
}