import { types, flow } from 'mobx-state-tree';
import MicroPubApi, { POST_ERROR } from './../../../api/MicroPubApi';

export default MediaAsset = types.model('MediaAsset', {
	uri: types.identifier,
	type: types.maybe(types.string),
	is_uploading: types.optional(types.boolean, false),
	did_upload: types.optional(types.boolean, false),
	remote_url: types.maybe(types.string),
	alt_text: types.maybe(types.string)
})
.actions(self => ({

	upload: flow(function* (service_object) {
		self.is_uploading = true
		const response = yield MicroPubApi.upload_image(service_object, self)
		console.log("MediaAsset:upload", response)
		if (response !== POST_ERROR) {
			self.remote_url = response.url
			self.did_upload = true
		}
		self.is_uploading = false
	}),
	
	set_alt_text: flow(function* (text) {
		console.log("MediaAsset:set_alt_text", text)
		self.alt_text = text
	})

}))