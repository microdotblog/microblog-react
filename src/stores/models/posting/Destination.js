import { types, flow } from 'mobx-state-tree';
import Post from "./Post";
import Page from './Page';
import Upload from './Upload'
import TempUpload from './TempUpload'

export default Destination = types.model('Destination', {
	uid: types.identifier,
	name: types.maybeNull(types.string),
	"microblog-audio": types.optional(types.boolean, false),
	"microblog-default": types.optional(types.boolean, false),
	"microblog-title": types.maybeNull(types.string),
	categories: types.optional(types.array(types.string), []),
	posts: types.optional(types.array(Post), []),
	pages: types.optional(types.array(Page), []),
	uploads: types.optional(types.array(Upload), []),
	temp_uploads: types.optional(types.array(TempUpload), [])
})
.actions(self => ({

	set_categories(categories) {
		self.categories = categories;
	},

	set_default(is_default) {
		self[ "microblog-default" ] = is_default
	},
	
	set_posts(entries) {
		console.log("Destination:set_posts", entries.length)
		const posts = entries.reduce((acc, entry) => {
			const uid =  entry.properties.uid && entry.properties.uid[0] ? parseInt(entry.properties.uid[0], 10) : 0
			const name = entry.properties.name[0] || ""
			const content = entry.properties.content[0] || ""
			const published = entry.properties.published[0]
			const url = entry.properties.url[0] || ""
			const post_status = entry.properties["post-status"][0] || ""
			const post = {
				uid: uid,
				name: name,
				content: content,
				published: published,
				url: url,
				post_status: post_status
			}
			if (!uid || url === "") {
				return acc;
			}
			return [...acc, post]
		}, [])
		console.log("Destination:set_posts:got_posts", posts.length)
		self.posts = posts // We could append to the list: [...self.posts, ...posts]
	},
	
	set_pages(entries) {
		console.log("Destination:set_pages", entries.length)
		const pages = entries.reduce((acc, entry) => {
			// MAYBE MAKE THIS MORE GENERIC? DRY.
			const uid =  entry.properties.uid && entry.properties.uid[0] ? parseInt(entry.properties.uid[0], 10) : 0
			const name = entry.properties.name[0] || ""
			const content = entry.properties.content[0] || ""
			const published = entry.properties.published[0]
			const url = entry.properties.url[0] || ""
			const post = {
				uid: uid,
				name: name,
				content: content,
				published: published,
				url: url
			}
			if (!uid || url === "") {
				return acc;
			}
			return [...acc, post]
		}, [])
		console.log("Destination:set_pages:got_pages", pages.length)
		self.pages = pages // We could append to the list: [...self.posts, ...posts]
	},

	set_uploads(entries) {
		console.log("Destination:set_uploads", entries.length)
		const uploads = entries.reduce((acc, entry) => {
			// MAYBE MAKE THIS MORE GENERIC? DRY.
			const url = entry.url || ""
			const published = entry.published || ""
			const poster = entry.poster || ""
			const upload = {
				url: url,
				published: published,
				poster: poster
			}
			if (url === "") {
				return acc;
			}
			return [...acc, upload]
		}, [])
		console.log("Destination:set_uploads:got_uploads", uploads.length)
		self.uploads = uploads // We could append to the list: [...self.posts, ...posts]
		// We want to clear out any uploads that have been uploaded.
		const temp_uploads = self.temp_uploads.filter(temp_upload => temp_upload.did_upload)
		temp_uploads.forEach(temp_upload => {
			self.temp_uploads.remove(temp_upload)
		})
	},

	upload_media: flow(function* (media, service_object) {
		console.log("Destination:upload_media", media, service_object)
		const temp_upload = TempUpload.create(media)
		self.temp_uploads.push(temp_upload)
		yield temp_upload.upload(service_object, self)
	})

}))