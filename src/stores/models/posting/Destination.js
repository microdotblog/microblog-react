import { types, flow } from "mobx-state-tree"
import { Alert, Platform } from "react-native"
import RNFS from "react-native-fs"
import axios from "axios"
import Post from "./Post"
import Page from "./Page"
import Upload from "./Upload"
import TempUpload from "./TempUpload"
import Auth from "../../Auth"
import App from "../../App"
import MicroPubApi, { POST_ERROR, FETCH_ERROR } from "../../../api/MicroPubApi"

const LARGE_UPLOAD_CHUNK_SIZE = 1000 * 1024
const LARGE_UPLOAD_MAX_SIZE = 1024 * 1024 * 1024
const LARGE_UPLOAD_POLL_INTERVAL = 4000
const LARGE_UPLOAD_MAX_ATTEMPTS = 45
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

const infer_extension_from_type = (mime = "") => {
	if (mime.includes("quicktime")) {
		return ".mov"
	}
	if (mime.includes("mp4")) {
		return ".mp4"
	}
	if (mime.includes("m4v")) {
		return ".m4v"
	}
	if (mime.includes("webm")) {
		return ".webm"
	}
	if (mime.includes("ogg")) {
		return ".ogv"
	}
	return ".mp4"
}

const build_file_name = (media, fallback_id) => {
	if (media?.fileName) {
		return media.fileName
	}
	if (media?.filename) {
		return media.filename
	}
	if (media?.name) {
		return media.name
	}
	return `upload-${fallback_id}${infer_extension_from_type(media?.type || "")}`
}

const ensure_local_uri_for_upload = async (media, fallback_name) => {
	const current_uri = media?.cached_uri || media?.cachedUri || media?.uri
	if (!current_uri) {
		return null
	}
	if (current_uri.startsWith("file://")) {
		return current_uri
	}
	const target_name = fallback_name || `upload-${Date.now()}${infer_extension_from_type(media?.type || "")}`
	const safe_name = target_name.replace(/[^\w.\-]/g, "_")
	const target_path = `${RNFS.CachesDirectoryPath}/${Date.now()}-${safe_name}`
	let source_path = current_uri
	try {
		source_path = decodeURIComponent(current_uri)
	}
	catch (e) {
		source_path = current_uri
	}
	try {
		if (Platform.OS == "ios" && current_uri.startsWith("ph://") && RNFS.copyAssetsFileIOS) {
			await RNFS.copyAssetsFileIOS(current_uri, target_path, 0, 0)
			return `file://${target_path}`
		}
		await RNFS.copyFile(source_path, target_path)
		return `file://${target_path}`
	}
	catch (error) {
		console.log("Destination:ensure_local_uri_for_upload:error", error)
		return null
	}
}

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
		temp_upload.cancel_source = axios.CancelToken.source()
		
		console.log("Created temp");

		const file_id = Math.floor(Math.random() * 1000000)
		const file_name = build_file_name(media, file_id)
		const file_type = media?.type || "video/mp4"

		console.log("File name:", file_name);

		const ensure_not_cancelled = () => {
			if (temp_upload.cancelled) {
				throw new Error("Upload canceled")
			}
		}

		try {
			const local_uri = yield ensure_local_uri_for_upload(media, file_name)
			if (!local_uri) {
				throw new Error("Could not access the selected file.")
			}

			temp_upload.cached_uri = local_uri
			const normalized_path = local_uri.replace("file://", "")
			const stats = yield RNFS.stat(normalized_path)
			console.log("Stats:", stats);
			const stat_size = parseInt(stats.size, 10)
			const raw_file_size = media?.fileSize || media?.file_size || stat_size
			const file_size = typeof raw_file_size == "string" ? parseInt(raw_file_size, 10) : raw_file_size

			if (!file_size || Number.isNaN(file_size)) {
				throw new Error("Could not read the selected file.")
			}

			if (file_size > LARGE_UPLOAD_MAX_SIZE) {
				throw new Error("File is too large. The maximum upload size is 1 GB.")
			}

			let offset = 0
			while (offset < file_size) {
				ensure_not_cancelled()
				const chunk_length = Math.min(LARGE_UPLOAD_CHUNK_SIZE, file_size - offset)
				console.log("RNFS reading...", normalized_path, chunk_length, offset);
				const chunk_data = yield RNFS.read(normalized_path, chunk_length, offset, "base64")
				console.log("RNFS read")
				const payload = {
					file_id: file_id,
					file_name: file_name,
					file_type: file_type,
					file_data: `data:${file_type};base64,${chunk_data}`
				}
				const chunk_result = yield MicroPubApi.upload_chunk(service_object, payload, temp_upload.cancel_source)
				ensure_not_cancelled()
				if (chunk_result === POST_ERROR) {
					throw new Error("Could not upload one of the video chunks.")
				}
				offset += chunk_length
				const upload_progress = Math.min(95, Math.floor((offset / file_size) * 100))
				yield temp_upload.update_progress(upload_progress)
			}

			ensure_not_cancelled()
			const finish_result = yield MicroPubApi.finish_upload(service_object, {
				file_id: file_id,
				file_name: file_name,
				file_type: file_type
			}, temp_upload.cancel_source)
			if (finish_result === POST_ERROR) {
				throw new Error("Could not finalize the upload.")
			}

			let upload_url = null
			for (let attempt = 0; attempt < LARGE_UPLOAD_MAX_ATTEMPTS; attempt++) {
				ensure_not_cancelled()
				const status = yield MicroPubApi.get_upload_status(service_object, file_id, temp_upload.cancel_source)
				if (status !== FETCH_ERROR && status?.is_processing === false && status?.url) {
					upload_url = status.url
					break
				}
				yield wait(LARGE_UPLOAD_POLL_INTERVAL)
			}

			if (!upload_url) {
				throw new Error("Upload is still processing. Please try again later.")
			}

			temp_upload.url = upload_url
			temp_upload.did_upload = true
			yield temp_upload.update_progress(100)

			const upload_entry = {
				url: upload_url,
				poster: temp_upload.poster
			}
			self.uploads.unshift(upload_entry)

			yield service.check_for_uploads_for_destination(self)

			const asset = self.uploads.find(a => a.url === upload_url)
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
