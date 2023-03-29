import { types, flow } from 'mobx-state-tree'
// import Auth from './Auth'
// import { Linking, Appearance, AppState, Platform, Dimensions } from 'react-native'
// import { theme_options } from '../utils/navigation'

export default Share = types.model('Share', {})
	.actions(self => ({

		hydrate: flow(function* () {
			console.log('Share:hydrate', self)
		}),
			
	}))
	.create()
