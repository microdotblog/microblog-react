import { Platform } from "react-native"
import RNFS from "react-native-fs"
import axios from "axios"
import MicroPubApi, { POST_ERROR, FETCH_ERROR } from "../../../api/MicroPubApi"

export const LARGE_UPLOAD_CHUNK_SIZE = 1000 * 1024
export const LARGE_UPLOAD_MAX_SIZE = 1024 * 1024 * 1024
export const LARGE_UPLOAD_POLL_INTERVAL = 4000
export const LARGE_UPLOAD_MAX_ATTEMPTS = 45

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

export const infer_extension_from_type = (mime = "") => {
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

export const build_file_name = (media, fallback_id) => {
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

export const ensure_local_uri_for_upload = async (media, fallback_name) => {
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
		if (Platform.OS === "ios" && current_uri.startsWith("ph://") && RNFS.copyAssetsFileIOS) {
			await RNFS.copyAssetsFileIOS(current_uri, target_path, 0, 0)
			return `file://${target_path}`
		}
		await RNFS.copyFile(source_path, target_path)
		return `file://${target_path}`
	}
	catch (error) {
		console.log("uploadLargeMediaTask:ensure_local_uri_for_upload:error", error)
		return null
	}
}

export const create_cancel_source = () => axios.CancelToken.source()

export async function upload_large_media_task({
	media,
	service_object,
	cancel_source,
	is_cancelled = () => false,
	on_progress,
	on_local_uri
}) {
	if (!service_object?.media_endpoint) {
		throw new Error("Missing media endpoint for this service.")
	}

	const ensure_not_cancelled = () => {
		if (is_cancelled()) {
			const error = new Error("Upload canceled")
			error.is_cancelled = true
			throw error
		}
	}

	const active_cancel_source = cancel_source || create_cancel_source()
	const file_id = Math.floor(Math.random() * 1000000)
	const file_name = build_file_name(media, file_id)
	const file_type = media?.type || "video/mp4"

	try {
		const local_uri = await ensure_local_uri_for_upload(media, file_name)
		if (!local_uri) {
			throw new Error("Could not access the selected file.")
		}

		on_local_uri?.(local_uri)

		const normalized_path = local_uri.replace("file://", "")
		const stats = await RNFS.stat(normalized_path)
		const stat_size = parseInt(stats.size, 10)
		const raw_file_size = media?.fileSize || media?.file_size || stat_size
		const file_size = typeof raw_file_size === "string" ? parseInt(raw_file_size, 10) : raw_file_size

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
			const chunk_data = await RNFS.read(normalized_path, chunk_length, offset, "base64")
			const payload = {
				file_id: file_id,
				file_name: file_name,
				file_type: file_type,
				file_data: `data:${file_type};base64,${chunk_data}`
			}
			const chunk_result = await MicroPubApi.upload_chunk(service_object, payload, active_cancel_source)
			ensure_not_cancelled()
			if (chunk_result === POST_ERROR) {
				throw new Error("Could not upload one of the video chunks.")
			}
			offset += chunk_length
			const upload_progress = Math.min(95, Math.floor((offset / file_size) * 100))
			if (on_progress) {
				await on_progress(upload_progress)
			}
		}

		ensure_not_cancelled()
		const finish_result = await MicroPubApi.finish_upload(service_object, {
			file_id: file_id,
			file_name: file_name,
			file_type: file_type
		}, active_cancel_source)
		if (finish_result === POST_ERROR) {
			throw new Error("Could not finalize the upload.")
		}

		let upload_url = null
		let upload_poster = null
		for (let attempt = 0; attempt < LARGE_UPLOAD_MAX_ATTEMPTS; attempt++) {
			ensure_not_cancelled()
			const status = await MicroPubApi.get_upload_status(service_object, file_id, active_cancel_source)
			if (status !== FETCH_ERROR && status?.is_processing === false && status?.url) {
				upload_url = status.url
				upload_poster = status.poster || null
				break
			}
			await wait(LARGE_UPLOAD_POLL_INTERVAL)
		}

		if (!upload_url) {
			throw new Error("Upload is still processing. Please try again later.")
		}

		if (on_progress) {
			await on_progress(100)
		}

		return {
			url: upload_url,
			poster: upload_poster,
			file_id,
			file_name,
			file_type
		}
	}
	catch (error) {
		throw error
	}
}
