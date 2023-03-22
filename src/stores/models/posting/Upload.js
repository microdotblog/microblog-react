import Clipboard from '@react-native-clipboard/clipboard'
import { types } from 'mobx-state-tree'
import Toast from 'react-native-simple-toast';

export default Post = types.model('Upload', {
	url: types.identifier,
	published: types.maybe(types.string)
})
	.actions(self => ({

		copy_html_to_clipboard() {
			let html = `<img src="${ self.url }" />`
			if (self.is_video()) {
				html = `<video controls src="${ self.url }"></video>`
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
		}
	}))