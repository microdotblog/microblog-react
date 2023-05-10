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
	console.log("xmlPayload:", xmlPayload)// TODO: REMOVE THIS

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'text/xml',
			},
			body: xmlPayload,
		})

		const options = {}

		const parser = new XMLParser(options)
		const xmlResponse = await response.text()
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
		const rsd_endpoint = axios
			.get(url)
			.then(response => {
				const dom_parser = new DOMParser()
				const doc = dom_parser.parseFromString(response.data, "text/html")
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
					Alert.alert("Whoops. There was an error connecting to the URL. Please check the url and try again.")
				}
				else {
					Alert.alert("Whoops, an error occured trying to connect. Please try again.")
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
				for (let i = 0; i < apis.length; i++) {
					const api = apis[ i ]
					if (api.getAttribute('preferred') === 'true') {
						blog_id = api.getAttribute('blogID')
						break
					}
				}
				console.log(blog_id)
				if (blog_id != null) {
					return blog_id
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
		console.log('MicroBlogApi:send_post', service, content, title, images, status)
		const verb = "metaWeblog.newPost"
		var info = {
			title: title,
			description: content,
			categories: categories,
			post_status: status
		}
		const params = [ service.blog_id, service.username, service.token, info ]

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
		const data = new FormData()
		var extension = ".jpg"
		if (file.mime === "image/png") {
			extension = ".png"
		}
		data.append("file", {
			name: `image${ extension }`,
			type: file.type,
			uri: file.uri
		})
		data.append("mp-destination", service.destination)
		console.log('MicroPubApi:upload_image', service, file, data)

		const upload = axios
			.post(service.media_endpoint, data, {
				headers: { Authorization: `Bearer ${ service.token }` },
				onUploadProgress: progressEvent => {
					const progress = Math.round(
						(progressEvent.loaded * 100) / progressEvent.total
					)
					file.update_progress(progress)
				},
				cancelToken: file.cancel_source.token,
			})
			.then(response => {
				console.log('MicroPubApi:upload_image:response', response)
				return response.data
			})
			.catch(error => {
				console.log(error.response)
				return POST_ERROR
			})
		return upload
	}

}

export default new XMLRPCApi()