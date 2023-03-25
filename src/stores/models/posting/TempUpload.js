import Clipboard from '@react-native-clipboard/clipboard'
import { types, flow } from 'mobx-state-tree'
import Toast from 'react-native-simple-toast'
import axios from 'axios'
import MicroPubApi, { POST_ERROR } from '../../../api/MicroPubApi'

export default TempUpload = types.model('TempUpload', {
	uri: types.identifier,
	type: types.maybe(types.string),
	url: types.maybe(types.string),
	published: types.maybe(types.string),
	poster: types.maybe(types.string),
	is_uploading: types.optional(types.boolean, false),
	progress: types.optional(types.number, 0),
	did_upload: types.optional(types.boolean, false),
})
	.actions(self => ({

		upload: flow(function* (service_object, destination) {
			console.log("TempUpload:upload", service_object, destination.uri)
			self.is_uploading = true
			self.cancel_source = axios.CancelToken.source()
			const response = yield MicroPubApi.upload_media(service_object, self, destination.uri)
			console.log("TempUpload:upload", response)
			if (response !== POST_ERROR) {
				self.did_upload = true
			}
			self.cancel_source = null
			self.is_uploading = false
		}),

		update_progress: flow(function* (progress) {
			console.log("TempUpload:update_progress", progress)
			self.progress = progress
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