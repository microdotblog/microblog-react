import { types, flow } from "mobx-state-tree"
import { Alert } from "react-native"
import Post from "./Post"
import Page from "./Page"
import Upload from "./Upload"
import TempUpload from "./TempUpload"
import Auth from "../../Auth"
import App from "../../App"
import MicroPubApi, { POST_ERROR } from "../../../api/MicroPubApi"
import { upload_large_media_task, create_cancel_source } from "./uploadLargeMediaTask"

export default Destination = types.model('Destination', {
	uid: types.identifier,
	name: types.maybeNull(types.string),
	"microblog-audio": types.optional(types.boolean, false),
	"microblog-default": types.optional(types.boolean, false),
	"microblog-title": types.maybeNull(types.string),
	categories: types.optional(types.array(types.string), []),
	syndicates: types.optional(types.array(types.model("Syndicate", {
		uid: types.identifier,
		name: types.maybeNull(types.string)
	})), []),
	posts: types.optional(types.array(Post), []),
	drafts: types.optional(types.array(Post), []),
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
	
	set_syndicate_to_targets(syndicates){
		self.syndicates = syndicates
	},
	
	set_posts(entries) {
		console.log("Destination:set_posts", entries.length)
		const posts = entries.reduce((acc, entry) => {
			const uid = entry.properties.uid && entry.properties.uid[0] ? parseInt(entry.properties.uid[0], 10) : 0
			const name = entry.properties.name ? entry.properties.name[0] : ""
			const content = entry.properties.content ? entry.properties.content[0] : ""
			const published = entry.properties.published ? entry.properties.published[0] : ""
			const url = entry.properties.url ? entry.properties.url[0] : ""
			const post_status = entry.properties["post-status"] ? entry.properties["post-status"][0] : ""
			const categories = entry.properties.category ? entry.properties.category : []
			const summary = entry.properties.summary ? entry.properties.summary[0] : null
			const post = {
				uid: uid,
				name: name,
				content: content,
				published: published,
				url: url,
				post_status: post_status,
				category: categories,
				summary: summary
			}
			if (uid === 0 || url === "") {
				return acc
			}
			return [...acc, post]
		}, [])
		console.log("Destination:set_posts:got_posts", posts.length)
		self.posts = posts // We could append to the list: [...self.posts, ...posts]
	},
	
	set_drafts(entries) {
		console.log("Destination:set_drafts", entries.length)
		const posts = entries.reduce((acc, entry) => {
			const uid = entry.properties.uid && entry.properties.uid[0] ? parseInt(entry.properties.uid[0], 10) : 0
			const name = entry.properties.name ? entry.properties.name[0] : ""
			const content = entry.properties.content ? entry.properties.content[0] : ""
			const published = entry.properties.published ? entry.properties.published[0] : ""
			const url = entry.properties.url ? entry.properties.url[0] : ""
			const post_status = entry.properties["post-status"] ? entry.properties["post-status"][0] : ""
			const categories = entry.properties.category ? entry.properties.category : []
			const summary = entry.properties.summary ? entry.properties.summary[0] : null
			const post = {
				uid: uid,
				name: name,
				content: content,
				published: published,
				url: url,
				post_status: post_status,
				category: categories,
				summary: summary
			}
			if (uid === 0 || url === "") {
				return acc
			}
			return [...acc, post]
		}, [])
		console.log("Destination:set_drafts:got_posts", posts.length)
		self.drafts = posts // We could append to the list: [...self.posts, ...posts]
	},	

	set_pages(entries) {
		console.log("Destination:set_pages", entries.length)
		const pages = entries.reduce((acc, entry) => {
			const uid =  entry.properties.uid && entry.properties.uid[0] ? parseInt(entry.properties.uid[0], 10) : 0
			const name = entry.properties.name ? entry.properties.name[0] : ""
			const content = entry.properties.content ? entry.properties.content[0] : ""
			const published = entry.properties.published ? entry.properties.published[0] : ""
			const url = entry.properties.url ? entry.properties.url[ 0 ] : ""
			const template = entry.properties[ "microblog-template" ] ? entry.properties[ "microblog-template" ][ 0 ] : false
			const post = {
				uid: uid,
				name: name,
				content: content,
				published: published,
				url: url,
				template: template
			}
			if (uid === 0 || url === "") {
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
			const alt = entry.alt || ""
			const is_ai = entry["microblog-ai"]
			const cdn = entry.cdn || {}
			const upload = {
				url: url,
				published: published,
				poster: poster,
				alt: alt,
				is_ai: is_ai,
				cdn: cdn
			}
			if (url === "") {
				return acc;
			}
			return [...acc, upload]
		}, [])
		console.log("Destination:set_uploads:got_uploads", uploads.length)
		self.uploads = uploads // We could append to the list: [...self.posts, ...posts]
		// We want to clear out any uploads that have been uploaded.
		const temp_uploads = self.temp_uploads.filter(temp_upload => temp_upload.did_upload || temp_upload.cancelled)
		temp_uploads.forEach(temp_upload => {
			const temp_index = self.temp_uploads.indexOf(temp_upload)
			if (temp_index >= 0) {
				self.temp_uploads.splice(temp_index, 1)
			}
		})
	},

	upload_large_media: flow(function* (media, service) {
		console.log("Destination:upload_large_media", media?.uri)
		const service_object = service?.service_object()
		if (!service_object?.media_endpoint) {
			Alert.alert("Upload Failed", "Missing media endpoint for this service.")
			return
		}

		const temp_upload = TempUpload.create(media)
		self.temp_uploads.push(temp_upload)
		temp_upload.is_uploading = true
		temp_upload.cancelled = false
		const cancel_source = create_cancel_source()
		temp_upload.cancel_source = cancel_source

		try {
			const result = yield upload_large_media_task({
				media,
				service_object,
				cancel_source,
				is_cancelled: () => temp_upload.cancelled,
				on_progress: progress => temp_upload.update_progress(progress),
				on_local_uri: uri => {
					temp_upload.cached_uri = uri
				}
			})

			temp_upload.url = result.url
			if (result.poster) {
				temp_upload.poster = result.poster
			}
			temp_upload.did_upload = true

			const upload_entry = {
				url: temp_upload.url,
				poster: temp_upload.poster
			}
			self.uploads.unshift(upload_entry)

			yield service.check_for_uploads_for_destination(self)

			const asset = self.uploads.find(a => a.url === temp_upload.url)
			if (App.post_modal_is_open && asset) {
				Auth.selected_user.posting?.add_to_post_text(asset.best_post_markup())
			}

			const temp_index = self.temp_uploads.indexOf(temp_upload)
			if (temp_index >= 0) {
				self.temp_uploads.splice(temp_index, 1)
			}
		}
		catch (error) {
			const was_cancelled = temp_upload.cancelled
			console.log("Destination:upload_large_media:error", error)
			if (!was_cancelled) {
				Alert.alert("Upload Failed", error?.message || "Could not upload video.")
			}
			temp_upload.did_upload = false
			yield temp_upload.update_progress(0)
			const temp_index = self.temp_uploads.indexOf(temp_upload)
			if (temp_index >= 0) {
				self.temp_uploads.splice(temp_index, 1)
			}
		}
		finally {
			temp_upload.is_uploading = false
			temp_upload.cancel_source = null
		}
	}),

	upload_media: flow(function* (media, service) {
		console.log("Destination:upload_media", media, service.service_object())
		const temp_upload = TempUpload.create(media)
		self.temp_uploads.push(temp_upload)
		const result = yield temp_upload.upload(service.service_object(), self)
		if (result) {
			console.log("Destination:upload_media:success", result)
			const upload = {
				url: temp_upload.url,
				poster: temp_upload.poster,
			}
			self.uploads.unshift(upload)
			self.temp_uploads.remove(temp_upload)
			// Because we're uploading from within the post editor, we also
			// want to automatically set the upload within the post.
			if(App.post_modal_is_open){
				const asset = self.uploads.find(a => a.url === upload.url)
				if(asset){
					Auth.selected_user.posting?.add_to_post_text(asset.best_post_markup())
					// TODO: Should we bring this back?
					// Navigation.pop(UPLOADS_MODAL_SCREEN)
				}
			}
			//service.check_for_uploads_for_destination(self)
		}
	})

}))
