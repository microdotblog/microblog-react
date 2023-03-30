import { types, flow } from 'mobx-state-tree'
import { ShareMenuReactView } from "react-native-share-menu";
import Tokens from './Tokens';
// import Auth from './Auth'
// import { Linking, Appearance, AppState, Platform, Dimensions } from 'react-native'
// import { theme_options } from '../utils/navigation'

export default Share = types.model('Share', {
	is_loading: types.optional(types.boolean, false),
})
	.actions(self => ({

		hydrate: flow(function* () {
			console.log('Share:hydrate', self)
			self.trigger_loading()
			yield Tokens.hydrate()
			ShareMenuReactView.data().then(({data}) => {
				const { mimeType } = data[ 0 ]
				const share_data = data[ 0 ].data
				console.log('Share:hydrate:data', share_data, mimeType, data)
			})
			setTimeout(() => {
				self.trigger_loading(false)
			}, 2000)
		}),

		trigger_loading: flow(function* (is_loading = true) {
			console.log('Share:trigger_loading', is_loading)
			self.is_loading = is_loading
		}),

		open_in_app: flow(function* () {
			console.log('Share:open_in_app')
			ShareMenuReactView.continueInApp()
		})

			
	}))
	.views(self => ({
		theme_accent_color(){
			return "#f80"
		}
	}))
	.create()
