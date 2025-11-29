import Clipboard from '@react-native-clipboard/clipboard'
import { types, flow } from 'mobx-state-tree'
import { Image } from 'react-native'
import Toast from 'react-native-simple-toast';

const get_image_size = uri => {
	return new Promise(resolve => {
		Image.getSize(uri,
			(width, height) => resolve({ width, height }),
			() => resolve({ width: null, height: null })
		)
	})
}

export default Upload = types.model('Upload', {
	url: types.identifier,
	published: types.maybe(types.string),
	poster: types.maybe(types.string),
	alt: types.maybe(types.string),
	width: types.maybe(types.number),
	height: types.maybe(types.number),
	is_ai: types.optional(types.boolean, true),
	cdn: types.optional(types.map(types.string), {})
})
	.actions(self => ({

		fetch_video_dimensions: flow(function* () {
			if (!self.poster || self.poster.length == 0) {
				return
			}
			if (self.width != undefined && self.height != undefined) {
				return
			}
			try {
				const size = yield get_image_size(self.poster)
				if (size.width != null && self.width == undefined) {
					self.width = size.width
				}
				if (size.height != null && self.height == undefined) {
					self.height = size.height
				}
			}
			catch (error) {
				console.log("Upload:fetch_video_dimensions:error", error)
			}
		}),

		best_post_markup_async: flow(function* () {
			if (self.is_video()) {
				yield self.fetch_video_dimensions()
			}
			return self.best_post_markup()
		}),

		copy_html_to_clipboard: flow(function* () {
			let html = "";
			if (self.is_video()) {
				yield self.fetch_video_dimensions()
			}
			if (self.alt && self.alt.length > 0) {
				html = `<img src="${ self.url }" alt="${ self.alt.replace('"', '') }">`
			}
			else {
				html = `<img src="${ self.url }">`
			}

			if (self.is_video()) {
				const dimensions = self.video_dimension_attributes()
				const poster = self.poster && (self.poster.length > 0) ? ` poster="${ self.poster }"` : ""
				html = `<video controls src="${ self.url }"${ dimensions }${ poster }></video>`
			}
			else if (self.is_audio()) {
				html = `<audio controls src="${ self.url }"></audio>`
			}

			Clipboard.setString(html)
			Toast.showWithGravity("HTML copied", Toast.SHORT, Toast.CENTER)
		}),

		copy_html_for_narration_to_clipboard() {
			let html = `<audio src="${ self.url }" preload="metadata" style="display: none"></audio>`;			
			Clipboard.setString(html);
			Toast.showWithGravity("HTML copied", Toast.SHORT, Toast.CENTER);
		},

		copy_link_to_clipboard() {
			Clipboard.setString(self.url)
			Toast.showWithGravity("URL copied", Toast.SHORT, Toast.CENTER)
		},

		copy_markdown_to_clipboard() {
			let markdown = ""
			if (self.alt && self.alt.length > 0) {
				markdown = `![${ self.alt.replace('"', '') }](${ self.url })`
			}
			else {
				markdown = `![](${ self.url })`
			}

			Clipboard.setString(markdown)
			Toast.showWithGravity("Markdown copied", Toast.SHORT, Toast.CENTER)
		}

	}))
	.views(self => ({
		nice_local_published_date() {
			const date = new Date(self.published)
			return date.toLocaleString()
		},
		video_dimension_attributes() {
			let dimensions = ""
			if (self.width != undefined && self.width != null) {
				dimensions += ` width="${ self.width }"`
			}
			if (self.height != undefined && self.height != null) {
				dimensions += ` height="${ self.height }"`
			}
			return dimensions
		},
		is_video() {
			return self.url.endsWith(".mp4") || self.url.endsWith(".mov") || self.url.endsWith(".m4v") || self.url.endsWith(".webm") || self.url.endsWith(".ogv") || self.url.endsWith(".ogg") || self.url.endsWith(".avi") || self.url.endsWith(".wmv") || self.url.endsWith(".flv") || self.url.endsWith(".swf") || self.url.endsWith(".m3u8")
		},
		is_audio() {
			return self.url.endsWith(".mp3") || self.url.endsWith(".wav") || self.url.endsWith(".ogg") || self.url.endsWith(".flac") || self.url.endsWith(".m4a") || self.url.endsWith(".aac") || self.url.endsWith(".wma")
		},
		best_post_markup(){
			if(this.is_audio() || this.is_video()){
				let html = `<img src="${ self.url }">`
				if (self.is_video()) {
					const dimensions = self.video_dimension_attributes()
					const poster = self.poster ? ` poster="${ self.poster }"` : ""
					html = `<video controls src="${ self.url }"${ dimensions }${ poster }"></video>`
				}
				else if (self.is_audio()) {
					html = `<audio controls src="${ self.url }"></audio>`
				}
				return html
			}
			else{
				return `![](${ self.url })`
			}
		}
	}))
