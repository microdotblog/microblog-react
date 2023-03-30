import * as React from 'react'
import { observer } from 'mobx-react'
import { View, Text, ActivityIndicator, Button } from 'react-native'
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
					Share.is_loading ?
						<ActivityIndicator color={Share.theme_accent_color()} size="large" />
						:
						<Button title="Open in App" onPress={Share.open_in_app} />
				}
			</View>
		)
	}

}
