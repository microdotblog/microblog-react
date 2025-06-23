import Clipboard from '@react-native-clipboard/clipboard'
import { types, flow } from 'mobx-state-tree'
import Toast from 'react-native-simple-toast'
import axios from 'axios'
import MicroPubApi, { POST_ERROR } from '../../../api/MicroPubApi'
import RNFS from 'react-native-fs'

export default TempUpload = types.model('TempUpload', {
	uri: types.identifier,
	cached_uri: types.maybe(types.string),
	name: types.maybe(types.string),
	type: types.maybe(types.string),
	url: types.maybe(types.string),
	published: types.maybe(types.string),
	poster: types.maybe(types.string),
	is_uploading: types.optional(types.boolean, false),
	progress: types.optional(types.number, 0),
	did_upload: types.optional(types.boolean, false),
	cancelled: types.optional(types.boolean, false),
})
	.actions(self => ({

		upload: flow(function* (service_object, destination) {
			console.log("TempUpload:upload", service_object, destination.uri)
			self.is_uploading = true
			self.cancel_source = axios.CancelToken.source()
			const response = yield MicroPubApi.upload_media(service_object, self, destination.uri)
			console.log("TempUpload:upload", response)
			if (response !== POST_ERROR && response.success) {
				const upload_url = response.headers?.location || response.data?.url
				if (upload_url && upload_url.trim() !== "") {
					self.url = upload_url
					self.did_upload = true
					console.log("TempUpload:upload:success", self.url)
				} else {
					console.error("TempUpload:upload:no_url", "Upload succeeded but no URL returned")
					self.did_upload = false
				}
			} else {
				console.error("TempUpload:upload:failed", response.error || "Upload failed")
				self.did_upload = false
			}
			self.cancel_source = null
			self.is_uploading = false
			return self.did_upload && self.url ? true : false
		}),

		update_progress: flow(function* (progress) {
			console.log("TempUpload:update_progress", progress)
			self.progress = progress
		}),

		cancel_upload: flow(function* () {
			if (self.cancel_source) {
				console.log("TempUpload:cancel_upload")
				self.cancel_source.cancel("Upload canceled by the user.")
				self.cancelled = true
				self.is_uploading = false
				self.progress = 0
			}
		}),

		copy_file_to_cached: flow(function* () {
			if (!self.uri?.startsWith('file://')) {
				return;
			}
		
			const source_path = self.uri.replace('file://', '');
			const filename = decodeURIComponent(source_path.split('/').pop());
			const target_path = `${RNFS.CachesDirectoryPath}/${filename}`;
				
			try {
				yield RNFS.copyFile(source_path, target_path);
				self.cached_uri = `file://${target_path}`;
			}
			catch (e) {
				console.warn('Failed to copy file and update URI:', e);
			}
		}),

		copy_html_to_clipboard() {
			let html = `<img src="${ self.url }">`
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
		is_video() {
			const uri = self.uri?.toLowerCase()
			return uri?.endsWith(".mp4") || uri?.endsWith(".mov") || uri?.endsWith(".m4v") || uri?.endsWith(".webm") || uri?.endsWith(".ogv") || uri?.endsWith(".ogg") || uri?.endsWith(".avi") || uri?.endsWith(".wmv") || uri?.endsWith(".flv") || uri?.endsWith(".swf")
		},
		is_audio() {
			return self.uri?.endsWith(".mp3") || self.uri?.endsWith(".wav") || self.uri?.endsWith(".ogg") || self.uri?.endsWith(".flac") || self.uri?.endsWith(".m4a") || self.uri?.endsWith(".aac") || self.uri?.endsWith(".wma")
		}
	}))