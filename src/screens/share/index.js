import * as React from 'react'
import { observer } from 'mobx-react'
import { View, Text, ActivityIndicator } from 'react-native'
import Share from '../../stores/Share'

@observer
export default class ShareScreen extends React.Component {

	componentDidMount() {
		console.log('ShareScreen:componentDidMount')
		Share.hydrate()
	}

	render() {
		return (
			<View style={{flex: 1, justifyContent: "center"}}>
				{
					Share.is_loading &&
					<ActivityIndicator color={Share.theme_accent_color()} size="large" />
				}
			</View>
		)
	}

}
