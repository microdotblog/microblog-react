import { Alert, Platform } from 'react-native';
import axios from 'axios';

export const FETCH_ERROR = 2
export const POST_ERROR = 3
export const FETCH_OK = 4
export const POST_OK = 5
export const NO_AUTH = 6
export const DELETE_ERROR = 7
export const RSD_NOT_FOUND = 8

class XMLRPCApi {

	async discover_rsd_endpoint(url) {
		console.log('XMLRPCApi:discover_rsd_endpoint', url);
		const rsd_endpoint = axios
			.get(url)
			.then(response => {
				const parser = new DOMParser()
				const doc = parser.parseFromString(response.data, "text/html")
				const rsd_link = doc.querySelector('link[type="application/rsd+xml"]')
				if (rsd_link) {
					return rsd_link.getAttribute('href')
				} else {
					return RSD_NOT_FOUND
				}
			})
			.catch(error => {
				console.log(error)
				return RSD_NOT_FOUND
			});
		return rsd_endpoint
	}
  
  async get_config(service) {
		console.log('XMLRPCApi:get_config', service.username);
		const config = axios
			.get(service.endpoint, {
				headers: { Authorization: `Bearer ${service.token}` },
				params: { q: "config" }
			})
			.then(response => {
				return response.data;
			})
			.catch(error => {
				console.log(error);
				return FETCH_ERROR;
			});
		return config;
	}

	async send_post(service, content, title = null, images = [], categories = [], status = null) {
		console.log('MicroBlogApi:send_post', service, content, title, images, status);
		const params = new FormData()
		params.append('h', 'entry')
		params.append('content', content)
		if (title) {
			params.append('name', title)
		}
		if (status) {
			params.append('post-status', status)
		}
		if (images.length) {
			const images_with_url = images.filter(image => image.remote_url !== null && image.did_upload)
			if (images_with_url) {
				// Now that we have images, we can append them to our params
				if (images_with_url.length === 1) {
					const first_image = images_with_url[0]
					params.append('photo', first_image.remote_url)
					if(first_image.alt_text != null && first_image.alt_text !== ""){
						params.append('mp-photo-alt', first_image.alt_text)
					}
				}
				else {
					images_with_url.map((image) => {
						params.append('photo[]', image.remote_url)
						if(image.alt_text != null && image.alt_text !== ""){
							params.append('mp-photo-alt[]', image.alt_text)
						}
					})
				}
			}
		}
		if (categories.length) {
			categories.map((category) => {
				params.append('category[]', category)
			})
		}
		params.append('mp-destination', service.destination)
		console.log("MicroBlogApi:send_post:FORM_DATA:PARAMS", params)
		
		const post = axios
			.post(service.endpoint, params ,{
				headers: { Authorization: `Bearer ${service.token}` }
			})
			.then(() => {
				return true;
			})
			.catch(error => {
				console.log("MicroBlogApi:send_post:ERROR", error.response.status, error.response.data);
				if (error.response.data.error_description !== undefined && error.response.data.error_description !== null) {
					Alert.alert(
						"Something went wrong.",
						`${error.response.data.error_description}`,
					)
				}
				else {
					Alert.alert(
						"Something went wrong.",
						`Please try again later.`,
					)
				}
				return POST_ERROR;
			});
		return post;
	}

	async get_categories(service, destination = null) {
		console.log('MicroPubApi:get_categories');
		const config = axios
			.get(service.endpoint, {
				headers: { Authorization: `Bearer ${service.token}` },
				params: { q: "category", "mp-destination": destination }
			})
			.then(response => {
				return response.data;
			})
			.catch(error => {
				console.log(error);
				return FETCH_ERROR;
			});
		return config;
	}

	async upload_image(service, file) {
		const data = new FormData();
		var extension = ".jpg"
		if (file.mime === "image/png") {
			extension = ".png"
		}
		data.append("file", {
			name: `image${extension}`,
			type: file.type,
			uri: file.uri
		})
		data.append("mp-destination", service.destination)
		console.log('MicroPubApi:upload_image', service, file, data);
		
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
				console.log('MicroPubApi:upload_image:response', response);
				return response.data;
			})
			.catch(error => {
				console.log(error.response);
				return POST_ERROR;
			});
		return upload;
	}

	async upload_media(service, file, destination) {
		const data = new FormData()
		// Get extension from file name, for example: 12345.jpg
		let extension = file.uri.split('.').pop()
		if (Platform.OS === "android" && file.name != null && file.name !== "") {
			extension = file.name.split('.').pop()
		}
		data.append("file", {
			name: `media.${extension.toLowerCase()}`,
			type: file.type,
			uri: file.uri,
		})
		data.append("mp-destination", destination)
		console.log('MicroPubApi:upload_media', service, file, data)

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
				console.log('MicroPubApi:upload_media:response', response)
				return response.data
			})
			.catch(error => {
				console.log(error.response)
				return POST_ERROR
			})
		return upload
	}

	async send_entry(service, entry, entry_type) {
		console.log('MicroBlogApi:send_post', service, entry, entry_type);
		const params = new FormData()
		params.append('h', 'entry')
		params.append(entry_type, entry)
		params.append('mp-destination', service.destination)
		console.log("MicroBlogApi:send_entry:FORM_DATA:PARAMS", params)
		
		const post = axios
			.post(service.endpoint, params ,{
				headers: { Authorization: `Bearer ${service.token}` }
			})
			.then(() => {
				return true;
			})
			.catch(error => {
				console.log("MicroBlogApi:send_entry:ERROR", error.response.status, error.response.data);
				if (axios.isCancel(error)) {
					console.log("Request canceled:", error.message)
				}
				else if (error.response.data.error_description !== undefined && error.response.data.error_description !== null) {
					Alert.alert(
						"Something went wrong.",
						`${error.response.data.error_description}`,
					)
				}
				else {
					Alert.alert(
						"Something went wrong.",
						`Please try again later.`,
					)
				}
				return POST_ERROR;
			});
		return post;
	}
	
	async post_update(service, content, url, title) {
		console.log('MicroBlogApi:MicroPub:post_update', content, url, title);
		const params = {
			"action": "update",
			"url": url,
			"mp-destination": service.destination,
			"replace": {
				"content": [
					content
				],
				"name": [
					title
				]
			}
		}
		console.log("MicroBlogApi:MicroPub:post_update:PARAMS", params)
		
		const post = axios
			.post(`https://micro.blog/micropub`, params ,{
				headers: { Authorization: `Bearer ${service.token}` }
			})
			.then(response => {
				return true;
			})
			.catch(error => {
				console.log("MicroBlogApi:post_update:ERROR", error.response.status, error.response.data);
				if (error.response.data.error_description !== undefined && error.response.data.error_description !== null) {
					Alert.alert(
						"Something went wrong.",
						`${error.response.data.error_description}. Try again later.`,
					)
				}
				else {
					Alert.alert(
						"Something went wrong.",
						`Please try again later.`,
					)
				}
				return POST_ERROR;
			});
		return post;
	}
	
	async get_posts(service, destination = null) {
		console.log('MicroPubApi:get_posts');
		const config = axios
			.get(service.endpoint, {
				headers: { Authorization: `Bearer ${service.token}` },
				params: { q: "source", "mp-destination": destination }
			})
			.then(response => {
				return response.data;
			})
			.catch(error => {
				console.log(error);
				return FETCH_ERROR;
			});
		return config;
	}
	
	async delete_post(service, url) {
		console.log('MicroBlogApi:MicroPub:delete_post', url);
		const params = {
			"action": "delete",
			"url": url,
			"mp-destination": service.destination
		}
		console.log("MicroBlogApi:MicroPub:delete_post:PARAMS", params)
		
		const post = axios
			.post(`https://micro.blog/micropub`, params ,{
				headers: { Authorization: `Bearer ${service.token}` }
			})
			.then(response => {
				return true;
			})
			.catch(error => {
				console.log("MicroBlogApi:delete_post:ERROR", error.response.status, error.response.data);
				if (error.response.data.error_description !== undefined && error.response.data.error_description !== null) {
					Alert.alert(
						"Something went wrong.",
						`${error.response.data.error_description}. Try again later.`,
					)
				}
				else {
					Alert.alert(
						"Something went wrong.",
						`Please try again later.`,
					)
				}
				return DELETE_ERROR;
			});
		return post;
	}

	async publish_draft(service, content, url, title) {
		console.log('MicroBlogApi:MicroPub:publish_post', url);
		const params = {
			"action": "update",
			"url": url,
			"mp-destination": service.destination,
			"replace": {
				"name": [ title ],
				"content": [ content ],
				"post-status": [ "published" ]
			}
		}
		console.log("MicroBlogApi:MicroPub:publish_draft:PARAMS", params)
		
		const post = axios
			.post(`https://micro.blog/micropub`, params ,{
				headers: { Authorization: `Bearer ${service.token}` }
			})
			.then(response => {
				return true;
			})
			.catch(error => {
				console.log("MicroBlogApi:publish_draft:ERROR", error.response.status, error.response.data);
				if (error.response.data.error_description !== undefined && error.response.data.error_description !== null) {
					Alert.alert(
						"Something went wrong.",
						`${error.response.data.error_description}. Try again later.`,
					)
				}
				else {
					Alert.alert(
						"Something went wrong.",
						`Please try again later.`,
					)
				}
				return DELETE_ERROR;
			});
		return post;
	}
	
	async get_pages(service, destination = null) {
		console.log('MicroPubApi:get_pages');
		const config = axios
			.get(service.endpoint, {
				headers: { Authorization: `Bearer ${service.token}` },
				params: { q: "source", "mp-destination": destination, "mp-channel": "pages" }
			})
			.then(response => {
				return response.data;
			})
			.catch(error => {
				console.log(error);
				return FETCH_ERROR;
			});
		return config;
	}
	
	async get_uploads(service, destination = null) {
		console.log('MicroPubApi:get_uploads');
		const config = axios
			.get(service.media_endpoint, {
				headers: { Authorization: `Bearer ${service.token}` },
				params: { q: "source", "mp-destination": destination }
			})
			.then(response => {
				return response.data;
			})
			.catch(error => {
				console.log(error);
				return FETCH_ERROR;
			});
		return config;
	}

	async delete_upload(service, url) {
		console.log('MicroBlogApi:MicroPub:delete_upload', url);
		const params = {
			"action": "delete",
			"url": url,
			"mp-destination": service.temporary_destination
		}
		console.log("MicroBlogApi:MicroPub:delete_upload:PARAMS", params)
		
		const upload = axios
			.post(service.media_endpoint, "" ,{
				headers: { Authorization: `Bearer ${ service.token }` },
				params: params
			})
			.then(response => {
				return true;
			})
			.catch(error => {
				console.log("MicroBlogApi:delete_upload:ERROR", error.response.status, error.response.data);
				if (error.response.data.error_description !== undefined && error.response.data.error_description !== null) {
					Alert.alert(
						"Something went wrong.",
						`${error.response.data.error_description}. Try again later.`,
					)
				}
				else {
					Alert.alert(
						"Something went wrong.",
						`Please try again later.`,
					)
				}
				return DELETE_ERROR;
			});
		return upload;
	}

}

export default new XMLRPCApi()