import { Alert } from 'react-native'
import axios from 'axios'
import { DOMParser } from "@xmldom/xmldom"
import { XMLParser } from 'fast-xml-parser'
import xmlrpc from '../utils/xmlrpc'

export const FETCH_ERROR = 2
export const POST_ERROR = 3
export const FETCH_OK = 4
export const POST_OK = 5
export const NO_AUTH = 6
export const DELETE_ERROR = 7
export const RSD_NOT_FOUND = 8
export const BLOG_ID_NOT_FOUND = "not_found"
export const XML_ERROR = 9

async function xmlRpcCall(url, methodName, params) {

	const xmlPayload = xmlrpc.make_request(methodName, params)
	// console.log("XML-RPC request", url, xmlPayload)

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'text/xml',
				'Accept': 'text/xml',
			},
			body: xmlPayload,
		})

		const options = {}
		const parser = new XMLParser(options)
		const xmlResponse = await response.text()
		console.log("XML-RPC response", response.status, xmlResponse)
		const jsonResponse = parser.parse(xmlResponse)

		if (jsonResponse[ "methodResponse" ][ "fault" ] != null) {
			const error_members = jsonResponse[ "methodResponse" ][ "fault" ][ "value" ][ "struct" ][ "member" ]
			const error_s = error_members[ error_members.length - 1 ][ "value" ][ "string" ]
			console.log("Fault error:", error_s)
			throw new Error(error_s)
		}

		return xmlrpc.from_json(jsonResponse)
	}
	catch (err) {
		console.log('Error in XML-RPC call:', err)
		throw err
	}
}

class XMLRPCApi {

	async discover_rsd_endpoint(url) {
		console.log('XMLRPCApi:discover_rsd_endpoint', url)
		const options = {
			headers: {
				"Accept": "text/html",
				"Cache-Control": "no-cache"
			}
		};
		const rsd_endpoint = fetch(url, options)
			.then(response => response.text())
			.then(data => {
				const dom_parser = new DOMParser()
				const doc = dom_parser.parseFromString(data, "text/html")
				const head = doc.getElementsByTagName('head')[ 0 ]
				const links = head.getElementsByTagName('link')
				let rsd_link
				for (let i = 0; i < links.length; i++) {
					const link = links[ i ]
					if (link.getAttribute('type') === 'application/rsd+xml') {
						rsd_link = link
						break
					}
				}
				if (rsd_link) {
					return rsd_link.getAttribute('href')
				} else {
					return RSD_NOT_FOUND
				}
			})
			.catch(error => {
				console.log(error)
				if (error?.toString()?.includes("Network error")) {
					Alert.alert("There was an error connecting to the URL. Please check the URL and try again.")
				}
				else {
					Alert.alert("An error occured trying to connect. Please try again.")
				}
				return RSD_NOT_FOUND
			})
		return rsd_endpoint
	}

	async discover_preferred_blog(url) {
		console.log('XMLRPCApi:discover_preferred_blog', url)
		const data = axios
			.get(url)
			.then(response => {
				const dom_parser = new DOMParser()
				const xmlDoc = dom_parser.parseFromString(response.data, 'text/xml')
				const apis = xmlDoc.getElementsByTagName('api')
				let blog_id
				let xmlrpc_url
				for (let i = 0; i < apis.length; i++) {
					const api = apis[ i ]
					if (api.getAttribute('preferred') === 'true') {
						blog_id = api.getAttribute('blogID')
						xmlrpc_url = api.getAttribute('apiLink')
						break
					}
				}
				console.log("XMLRPCApi:discover_preferred_blog:blog_id", blog_id)
				if (blog_id != null) {
					return {
						blog_id: blog_id,
						xmlrpc_url: xmlrpc_url
					}
				} else {
					return BLOG_ID_NOT_FOUND
				}
			})
			.catch(error => {
				console.log(error)
				return BLOG_ID_NOT_FOUND
			})
		return data
	}

	async check_credentials_and_get_recent_posts(url, blog_id, username, password) {
		// We should keep all other XML stuff generic and just pass in terms,
		// However, for now, let's just have the recent_posts one to check for credentials
		const verb = "metaWeblog.getRecentPosts"
		const params = [ blog_id, username, password ]
		console.log("XMLRPCApi:check_credentials_and_get_recent_posts", url, blog_id, username)

		const response = xmlRpcCall(url, verb, params)
			.then(data => {
				console.log('Data received:', data)
				return true
			})
			.catch(err => {
				console.log('XMLRPCApi:error', err)
				// Check if error is incorrect password/username
				if (err?.toString()?.includes("username or password")) {
					Alert.alert("Whoops. Your username or password is wrong. Please try again.")
				}
				else {
					Alert.alert("Whoops, an error occured. Please try again.")
				}
				return XML_ERROR
			})
		return response
	}

	async get_config(service) {
		// Config is basically the same as check_credentials_and_get_recent_posts above, just using the service_object
		console.log('XMLRPCApi:get_config', service)
		// Get metaWeblog categories
		const verb = "metaWeblog.getCategories"
		const params = [ service.blog_id, service.username, service.token ]
		console.log("XMLRPCApi:get_config", service.endpoint)

		const config = xmlRpcCall(service.endpoint, verb, params)
			.then(data => {
				console.log('Data received:', data)
				return data
			})
			.catch(err => {
				console.log('XMLRPCApi:error', err)
				// Check if error is incorrect password/username
				if (err?.toString()?.includes("username or password")) {
					Alert.alert("Whoops. Your username or password is wrong. Please try again.")
				}
				else {
					Alert.alert("Whoops, an error occured. Please try again.")
				}
				return XML_ERROR
			})
		return config
	}

	async send_post(service, content, title = null, images = [], categories = [], status = null) {
		console.log('XMLRPCApi:send_post', content, title, images, status)
		var is_wordpress = service.endpoint.includes("xmlrpc.php")
		var verb = ""
		var params = []
		const featured_image_id = images.length > 0 ? images[ 0 ]?.upload_id : null

		if (images.length > 0) {
			const image_html = images.map(image => `<img src="${ image.remote_url }" alt="${ image.alt_text ?? "" }">`).join(" ")
			content = `${content}\n\n${image_html}`
		}

		console.log("XMLRPCApi:send_post content", content)
		
		if (is_wordpress) {
			// special params if WordPress
			verb = "wp.newPost"
			var info = {
				post_title: title == null ? "" : title,
				post_content: content,
				post_status: status === "published" ? "publish" : status,
				terms: {
					category: categories
				},
				...featured_image_id && {
					wp_post_thumbnail: featured_image_id
				}
			}
			params = [ service.blog_id, service.username, service.token, info ]
		}
		else {
			// if not WordPress, fall back on generic Blogger API (not MetaWeblog)
			const app_key = ""
			const publish = true
			verb = "blogger.newPost"
			params = [ app_key, service.blog_id, service.username, service.token, content, publish ]
		}

		const response = xmlRpcCall(service.endpoint, verb, params)
			.then(data => {
				console.log('Data received:', data)
				return true
			})
			.catch(err => {
				console.log('XMLRPCApi:error', err)
				Alert.alert("An error occured. Please try again.")
				return XML_ERROR
			})
		return response
	}

	async get_categories(service) {
		const verb = "metaWeblog.getCategories"
		const params = [ service.blog_id, service.username, service.token ]
		console.log("XMLRPCApi:get_categories", service.endpoint)

		const config = xmlRpcCall(service.endpoint, verb, params)
			.then(data => {
				console.log('Data received:', data)
				return data
			})
			.catch(err => {
				console.log('XMLRPCApi:error', err)
				// Check if error is incorrect password/username
				if (err?.toString()?.includes("username or password")) {
					Alert.alert("Whoops. Your username or password is wrong. Please try again.")
				}
				else {
					Alert.alert("Whoops, an error occured. Please try again.")
				}
				return XML_ERROR
			})
		return config
	}

	async upload_image(service, file) {
		const verb = "metaWeblog.newMediaObject"
		var extension = ".jpg"
		if (file.mime === "image/png") {
			extension = ".png"
		}
		const image_data = {
			name: `image${extension}`,
			type: file.type,
			bits: file.base64
		}

		const params = [ service.blog_id, service.username, service.token, image_data ]

		const upload = xmlRpcCall(service.endpoint, verb, params)
			.then(data => {
				console.log('XMLRPCApi:upload_image:response', data)
				if (data && (data.link || data.url)) {
					return { ...data, success: true }
				} else {
					console.error('XMLRPCApi:upload_image:no_url', 'Upload succeeded but no URL returned')
					Alert.alert("Upload Failed", "Upload completed but no URL was returned from server")
					return { success: false, error: "No URL returned" }
				}
			})
			.catch(err => {
				console.error('XMLRPCApi:upload_image:error', err)
				let errorMessage = "Image upload failed"
				if (err?.toString()?.includes("username or password")) {
					errorMessage = "Authentication failed - check your credentials"
				} else if (err?.toString()?.includes("Network")) {
					errorMessage = "Network error - check your connection"
				} else if (err?.message) {
					errorMessage = err.message
				}
				
				Alert.alert("Upload Failed", errorMessage)
				return { success: false, error: errorMessage }
			})
		return upload
	}

}

export default new XMLRPCApi()