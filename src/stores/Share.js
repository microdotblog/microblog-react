import { types, flow } from 'mobx-state-tree'
import { ShareMenuReactView } from "react-native-share-menu";
import Tokens from './Tokens';
// import Auth from './Auth'
// import { Linking, Appearance, AppState, Platform, Dimensions } from 'react-native'
// import { theme_options } from '../utils/navigation'

export default Share = types.model('Share', {})
	.actions(self => ({

		hydrate: flow(function* () {
			console.log('Share:hydrate', self)
			yield Tokens.hydrate()
			ShareMenuReactView.data().then(({data}) => {
				const { mimeType } = data[ 0 ]
				const share_data = data[ 0 ].data
				console.log('Share:hydrate:data', share_data, mimeType)
			})
		}),
			
	}))
	.create()
