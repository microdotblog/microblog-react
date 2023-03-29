import * as React from 'react'
import { observer } from 'mobx-react'
import { View, Text } from 'react-native'
import Share from '../../stores/Share'

@observer
export default class ShareScreen extends React.Component {

	componentDidMount() {
		console.log('ShareScreen:componentDidMount')
		Share.hydrate()
	}

	render() {
		return (
			<View>
				<Text>Hello</Text>
			</View>
		)
	}

}
