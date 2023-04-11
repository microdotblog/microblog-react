import { types, flow } from 'mobx-state-tree';
import MicroPubApi, { POST_ERROR } from './../../../api/MicroPubApi';
const FS = require("react-native-fs")
import axios from 'axios';

export default MediaAsset = types.model('MediaAsset', {
	uri: types.identifier,
	type: types.maybe(types.string),
	mime: types.maybe(types.string),
	width: types.optional(types.number, 0),
	height: types.optional(types.number, 0),
	is_uploading: types.optional(types.boolean, false),
	did_upload: types.optional(types.boolean, false),
	remote_url: types.maybe(types.string),
	alt_text: types.maybe(types.string),
	progress: types.optional(types.number, 0)
})
.actions(self => ({

	upload: flow(function* (service_object) {
		self.is_uploading = true
		self.cancel_source = axios.CancelToken.source()
		const response = yield MicroPubApi.upload_image(service_object, self)
		console.log("MediaAsset:upload", response)
		if (response !== POST_ERROR) {
			self.remote_url = response.url
			self.did_upload = true
		}
		self.cancel_source = null
		self.is_uploading = false
	}),
	
	set_alt_text: flow(function* (text) {
		console.log("MediaAsset:set_alt_text", text)
		self.alt_text = text
	}),

	update_progress: flow(function* (progress) {
		console.log("MediaAsset:update_progress", progress)
		self.progress = progress
	}),

	cancel_upload: flow(function* () {
		if (self.cancel_source) {
			console.log("MediaAsset:cancel_upload")
			self.cancel_source.cancel("Upload canceled by the user.")
		}
	})

}))
.views(self => ({

	async save_to_temp() {
		const filename = (Math.floor(Math.random() * 10000)).toString() + self.file_extension()
		const new_path = FS.TemporaryDirectoryPath + filename

		var new_asset = MediaAsset.create({
			uri: "file://" + new_path,
			type: self.type,
			width: self.width,
			height: self.height
		})

		var promise = FS.copyFile(self.uri, new_path).then((result) => {
			return new_asset
		})
		
		return promise
	},
	
	async delete_file() {
		const path = self.uri.replace("file://", "")
		FS.unlink(path)
	},
  
	file_extension() {
		if (self.type === "image/png") {
			return ".png"			
		}
		else if (self.type === "image/gif") {
			return ".gif"
		}
		else {
			return ".jpg"
		}
	},
	
	is_landscape() {
		return self.width > self.height
	},

	is_portrait() {
		return self.height > self.width
	},
	
	is_square() {
		return self.width == self.height
	},
	
	scale_width_for_height(new_height) {
		return self.width / self.height * new_height
	},
	
	scale_height_for_width(new_width) {
		return self.height / self.width * new_width
	}
  
}))