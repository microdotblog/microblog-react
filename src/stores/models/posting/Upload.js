import Clipboard from '@react-native-clipboard/clipboard'
import { types } from 'mobx-state-tree'
import Toast from 'react-native-simple-toast';

export default Post = types.model('Upload', {
	url: types.identifier,
	published: types.maybe(types.string)
})
	.actions(self => ({

		copy_html_to_clipboard() {
			const html = `<img src="${ self.url }" />`
			Clipboard.setString(html)
			Toast.showWithGravity("Imagee HTML copied", Toast.SHORT, Toast.CENTER)
		},

		copy_link_to_clipboard() {
			Clipboard.setString(self.url)
			Toast.showWithGravity("Image URL copied", Toast.SHORT, Toast.CENTER)
		},

		copy_markdown_to_clipboard() {
			const markdown = `![${ self.url }](${ self.url })`
			Clipboard.setString(markdown)
			Toast.showWithGravity("Image Markdown copied", Toast.SHORT, Toast.CENTER)
		}

	}))
	.views(self => ({
		nice_local_published_date() {
			const date = new Date(self.published)
			return date.toLocaleString()
		}
	}))