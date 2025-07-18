import { Alert, Platform } from 'react-native';
import axios from 'axios';
import { DOMParser } from "@xmldom/xmldom";
import App from "./../stores/App";

export const FETCH_ERROR = 2
export const POST_ERROR = 3
export const FETCH_OK = 4
export const POST_OK = 5
export const NO_AUTH = 6
export const DELETE_ERROR = 7
export const MICROPUB_NOT_FOUND = 8

class MicroPubApi {
  
  async discover_micropub_endpoints(url, alternate_html_match = false) {
    console.log("MicroPubApi:discover_micropub_endpoints", url, alternate_html_match)
    try {
      const response = await fetch(url, {
        headers: {
          "Accept": "text/html",
          "Cache-Control": "no-cache"
        }
      })
      const html = await response.text()
      let links = []
      
      if (alternate_html_match) {
        const headContent = html.match(/<head[^>]*>[\s\S]*?<\/head>/i)?.[0] || ""
  
        if (!headContent) {
          throw new Error("Head content not found")
        }
        
        const wrappedHtml = `<html>${headContent}</html>`
        const dom_parser = new DOMParser()
        const doc = dom_parser.parseFromString(wrappedHtml, "text/html")
        links = doc.getElementsByTagName("link")
      }
      else {
        const dom_parser = new DOMParser()
        const doc = dom_parser.parseFromString(html, "text/html")
        const head = doc.getElementsByTagName("head")[0]
        links = head.getElementsByTagName("link")
      }
      
      let micropub_link, auth_link, token_link
      for (let i = 0; i < links.length; i++) {
        const link = links[i]
        if (link.getAttribute("rel") === "micropub") {
          micropub_link = link
        }
        else if (link.getAttribute("rel") === "authorization_endpoint") {
          auth_link = link
        }
        else if (link.getAttribute("rel") === "token_endpoint") {
          token_link = link
        }
      }
  
      if (micropub_link && auth_link && token_link) {
        return {
          micropub: micropub_link.getAttribute("href"),
          auth: auth_link.getAttribute("href"),
          token: token_link.getAttribute("href"),
          is_wordpress: micropub_link.getAttribute("href").includes("/wp-json")
        }
      }
      else {
        return MICROPUB_NOT_FOUND
      }
    }
    catch (error) {
      console.log(error)
      if (error?.toString()?.includes("Network error")) {
        Alert.alert("Whoops. There was an error connecting to the URL. Please check the url and try again.")
      }
      else if (!alternate_html_match) {
        return this.discover_micropub_endpoints(url, true)
      }
      else {
        Alert.alert("Whoops, an error occurred trying to connect. Please try again.")
      }
      return MICROPUB_NOT_FOUND
    }
  }

	make_auth_url(me_url, base_auth_url) {
		var new_url = base_auth_url		
		var new_state = Math.floor(Math.random() * 10000).toString(); // need to store this
		
		new_url = new_url + "?me=" + encodeURIComponent(me_url)
		new_url = new_url + "&redirect_uri=" + encodeURIComponent("https://micro.blog/indieauth/redirect")
		new_url = new_url + "&client_id=" + encodeURIComponent("https://micro.blog/")
		new_url = new_url + "&state=" + new_state
		new_url = new_url + "&scope=" + "create"
		new_url = new_url + "&response_type=" + "code"
		
		return new_url
	}

	async verify_code(service, auth_url) {		
		const regex = /[?&]code=([^&]+)/
		const match = regex.exec(auth_url)
		if (match) {			
			const auth_code = match[1];
			console.log("Micropub: Got code:", auth_code);
			console.log("Micropub: Sending to", service.token_endpoint)
			var params_s = ""
			params_s = params_s + "client_id=" + encodeURIComponent("https://micro.blog/")
			params_s = params_s	+ "&code=" + encodeURIComponent(auth_code)
			params_s = params_s + "&redirect_uri=" + encodeURIComponent("https://micro.blog/indieauth/redirect")
			params_s = params_s	+ "&grant_type=" + "authorization_code"
			const verify_response = axios
				.post(service.token_endpoint, params_s, {
					headers: {
						"Content-type": "application/x-www-form-urlencoded",
						"Accept": "application/json"
					}
				})
				.then(response => {
					const access_token = response.data["access_token"]
					console.log("Micropub: Got access token:", access_token)
					if(access_token != null){
						return access_token
					}
					return NO_AUTH;
				})
				.catch(error => {
					console.log(error)
					return FETCH_ERROR;
				});
			return verify_response
		}
		else {
			return NO_AUTH
		}
	}

	async get_config(service) {
		console.log('MicroPubApi:get_config', service.username);
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

	async send_post(service, content, title = null, assets = [], categories = [], status = null, syndicate_to = null, summary = null) {
		console.log('MicroBlogApi:send_post', service, content, title, assets, status, syndicate_to);		
		const params = new FormData()
		params.append('h', 'entry')
		params.append('content', content)
		if (title) {
			params.append('name', title)
		}
		if (status) {
			params.append('post-status', status)
		}
		if (assets.length) {
			const images_with_url = assets.filter(asset => asset.remote_url !== null && asset.did_upload && !asset.is_video)
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
			const videos_with_url = assets.filter(asset => asset.remote_url !== null && asset.did_upload && asset.is_video)
			if (videos_with_url) {
				// Now that we have images, we can append them to our params
				if (videos_with_url.length === 1) {
					const first_asset = videos_with_url[0]
					params.append('video', first_asset.remote_url)
				}
				else {
					videos_with_url.map((video) => {
						params.append('video[]', video.remote_url)
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
		if (syndicate_to != null && syndicate_to.length > 0){
			syndicate_to.map((syndicate) => {
				params.append('mp-syndicate-to[]', syndicate)
			})
		}
		else if(syndicate_to != null && syndicate_to.length === 0){
			params.append('mp-syndicate-to[]', "")
		}
		if (summary) {
			params.append('summary', summary)
		}
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
	
	async get_syndicate_to(service, destination = null) {
		console.log('MicroPubApi:get_syndicate_to');
		const config = axios
			.get(service.endpoint, {
				headers: { Authorization: `Bearer ${service.token}` },
				params: { q: "syndicate-to", "mp-destination": destination }
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
		data.append("file", {
			name: `image${file.file_extension()}`,
			type: file.type,
			uri: file.uri
		})
		data.append("mp-destination", App.current_screen_name === "microblog.UploadsScreen" ? service.temporary_destination : service.destination)
		console.log('MicroPubApi:upload_image', service, file, data);
		
		const upload = axios
			.post(service.media_endpoint, data, {
				headers: { Authorization: `Bearer ${ service.token }` },
				timeout: 60000,
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
				return { ...response, success: true };
			})
			.catch(error => {
				console.error('MicroPubApi:upload_image:error', error);
				file.update_progress(0); // Reset progress on failure
				
				if (axios.isCancel(error)) {
					return { success: false, error: "Upload cancelled", cancelled: true };
				}
				
				let errorMessage = "Upload failed";
				if (error.code === 'ECONNABORTED') {
					errorMessage = "Upload timed out - check your connection and try again";
				} else if (error.response) {
					errorMessage = error.response.data?.error_description || 
						error.response.data?.error || 
						`Server error (${error.response.status})`;
				} else if (error.request) {
					errorMessage = "Network error - check your connection";
				}
				
				Alert.alert("Upload Failed", errorMessage);
				return { success: false, error: errorMessage };
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
		data.append("mp-destination", App.current_screen_name === "microblog.UploadsScreen" || service.temporary_destination !== null && service.temporary_destination !== service.destination ? service.temporary_destination : service.destination)
		console.log('MicroPubApi:upload_media', service, file, data)

		const upload = axios
			.post(service.media_endpoint, data, {
				headers: { Authorization: `Bearer ${ service.token }` },
				timeout: 60000, // 60 second timeout
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
				return { ...response, success: true }
			})
			.catch(error => {
				console.error('MicroPubApi:upload_media:error', error)
				file.update_progress(0); // Reset progress on failure
				
				if (axios.isCancel(error)) {
					return { success: false, error: "Upload cancelled", cancelled: true }
				}
				
				let errorMessage = "Media upload failed"
				if (error.code === 'ECONNABORTED') {
					errorMessage = "Upload timed out - check your connection and try again"
				} else if (error.response) {
					errorMessage = error.response.data?.error_description || 
						error.response.data?.error || 
						`Server error (${error.response.status})`
				} else if (error.request) {
					errorMessage = "Network error - check your connection"
				}
				
				Alert.alert("Upload Failed", errorMessage)
				return { success: false, error: errorMessage }
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
	
	async post_update(service, content, url, title, categories, post_status = "") {
		console.log('MicroBlogApi:MicroPub:post_update', content, url, title, categories);
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
				],
				"category": categories,
				"post-status": [
					post_status
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
	
	async get_posts(service, destination = null, is_drafts = false) {
		console.log('MicroPubApi:get_posts', is_drafts);
		let params = {
			q: "source", "mp-destination": destination
		};
		if (is_drafts) {
			params["post-status"] = "draft";
		}
		console.log('MicroPubApi:get_posts params', params);
		const config = axios
			.get(service.endpoint, {
				headers: { Authorization: `Bearer ${service.token}` },
				params: params
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
			.post(service.media_endpoint, "", {
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

	async get_collections(service, destination = null) {
		console.log('MicroPubApi:get_collections');
		const config = axios
			.get(service.endpoint, {
				headers: { Authorization: `Bearer ${service.token}` },
				params: { q: "source", "mp-destination": destination, "mp-channel": "collections" }
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

	async get_uploads_from_collection(service, destination, collection_url) {		
		console.log('MicroPubApi:get_uploads_from_collection');
		const config = axios
			.get(service.media_endpoint, {
				headers: { Authorization: `Bearer ${service.token}` },
				params: {
					q: "source",
					"mp-destination": destination,
					"microblog-collection": collection_url
				}
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

	async add_upload_to_collection(service, destination, collection_url, upload_url) {
		console.log('MicroPubApi:add_upload_to_collection');

		const params = {
			"action": "update",
		    "mp-channel": "collections",
			"mp-destination": service.temporary_destination,
			"url": collection_url,
			"add": {
				"photo": [ upload_url ]
			}
		};
		
		const config = axios
			.post(service.endpoint, params, {
				headers: { Authorization: `Bearer ${ service.token }` }
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

	async remove_upload_from_collection(service, destination, collection_url, upload_url) {
		console.log('MicroPubApi:remove_upload_from_collection');
	
		const params = {
			"action": "update",
			"mp-channel": "collections",
			"mp-destination": service.temporary_destination,
			"url": collection_url,
			"delete": {
				"photo": [ upload_url ]
			}
		}
		
		const config = axios
			.post(service.endpoint, params, {
				headers: { Authorization: `Bearer ${ service.token }` }
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

	async create_collection(service, destination, name) {
		console.log('MicroPubApi:create_collection');
	
		const params = {
			"mp-channel": "collections",
			"mp-destination": service.temporary_destination,
			"properties": {
				"name": [ name ]
			}
		};
		
		const config = axios
			.post(service.endpoint, params, {
				headers: { Authorization: `Bearer ${ service.token }` }
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
	
	async delete_collection(service, destination, collection_url) {
		console.log('MicroPubApi:delete_collection');
		
		const params = {
			"mp-channel": "collections",
			"mp-destination": service.temporary_destination,
			"action": "delete",
			"url": collection_url
		};
		
		const config = axios
			.post(service.endpoint, params, {
				headers: { Authorization: `Bearer ${ service.token }` }
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

	async set_alt_for_upload(service, destination, upload_url, alt_text) {
		console.log('MicroPubApi:set_alt_for_upload');

		const params = new FormData()
		params.append('mp-destination', service.temporary_destination);
		params.append('action', 'update');
		params.append('url', upload_url);
		params.append('alt', alt_text);
		
		const options = {
			method: "POST",
			headers: {
				Authorization: `Bearer ${ service.token }`
			},
			body: params
		};

		const response = await fetch(service.media_endpoint, options);
		return response;
	}
}

export default new MicroPubApi()
