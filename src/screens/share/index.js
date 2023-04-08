import * as React from 'react'
import { observer } from 'mobx-react'
import { View, ActivityIndicator } from 'react-native'
import Share from '../../stores/Share'
import ShareDevComponent from '../../components/share/dev'
import App from '../../stores/App'
import SharePostScreen from './post'

@observer
export default class ShareScreen extends React.Component {

	componentDidMount() {
		console.log('ShareScreen:componentDidMount')
		Share.hydrate()
	}

	render() {
		return (
			<View style={{
				flex: 1,
				backgroundColor: App.theme_background_color(),
				padding: 8
			}}>
				{
					Share.is_loading ?
						<ActivityIndicator color={Share.theme_accent_color()} size="large" />
						:
						<SharePostScreen />
				}
				<ShareDevComponent />
			</View>
		)
	}

}
