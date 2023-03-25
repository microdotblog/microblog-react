import Clipboard from '@react-native-clipboard/clipboard'
import { types, flow } from 'mobx-state-tree'
import Toast from 'react-native-simple-toast';
import axios from 'axios';
import MicroPubApi from '../../../api/MicroPubApi'

const CancelSource = types.snapshotProcessor(
	types.custom({
		name: "CancelSource",
		fromSnapshot() {
			return axios.CancelToken.source()
		},
		toSnapshot(value) {
			return value
		},
		isTargetType(value) {
			return value && "token" in value && "cancel" in value
		},
		getValidationMessage(value) {
			return "CancelSource must be an Axios CancelToken source"
		},
	}),
	{
		preProcessor: snapshot => {
			return snapshot
		},
		postProcessor: snapshot => {
			return axios.CancelToken.source()
		},
	}
)

export default Post = types.model('Upload', {
	url: types.identifier,
	published: types.maybe(types.string),
	poster: types.maybe(types.string),
	is_uploading: types.optional(types.boolean, false),
	progress: types.optional(types.number, 0),
	cancel_source: types.maybeNull(CancelSource),
})
	.actions(self => ({

		upload: flow(function* (service_object) {
			self.is_uploading = true
			self.cancel_source = axios.CancelToken.source()
			const response = yield MicroPubApi.upload_image(service_object, self)
			console.log("MediaAsset:upload", response)
			if (response !== POST_ERROR) {
				self.did_upload = true
			}
			self.cancel_source = null
			self.is_uploading = false
		}),

		copy_html_to_clipboard() {
			let html = `<img src="${ self.url }" />`
			if (self.is_video()) {
				html = `<video controls src="${ self.url }"></video>`
			}
			else if (self.is_audio()) {
				html = `<audio controls src="${ self.url }"></audio>`
			}
			Clipboard.setString(html)
			Toast.showWithGravity("HTML copied", Toast.SHORT, Toast.CENTER)
		},

		copy_link_to_clipboard() {
			Clipboard.setString(self.url)
			Toast.showWithGravity("URL copied", Toast.SHORT, Toast.CENTER)
		},

		copy_markdown_to_clipboard() {
			let markdown = `![${ self.url }](${ self.url })`
			Clipboard.setString(markdown)
			Toast.showWithGravity("Markdown copied", Toast.SHORT, Toast.CENTER)
		}

	}))
	.views(self => ({
		nice_local_published_date() {
			const date = new Date(self.published)
			return date.toLocaleString()
		},
		is_video() {
			return self.url.endsWith(".mp4") || self.url.endsWith(".mov") || self.url.endsWith(".m4v") || self.url.endsWith(".webm") || self.url.endsWith(".ogv") || self.url.endsWith(".ogg") || self.url.endsWith(".avi") || self.url.endsWith(".wmv") || self.url.endsWith(".flv") || self.url.endsWith(".swf")
		},
		is_audio() {
			return self.url.endsWith(".mp3") || self.url.endsWith(".wav") || self.url.endsWith(".ogg") || self.url.endsWith(".flac") || self.url.endsWith(".m4a") || self.url.endsWith(".aac") || self.url.endsWith(".wma")
		}
	}))