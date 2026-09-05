import { Alert } from 'react-native';
import axios from 'axios';
import { URL, URLSearchParams } from 'react-native-url-polyfill'
import { DOMParser } from "@xmldom/xmldom";
import App from "./../stores/App";
import { buildUploadFileName } from "../utils/file_names"

export const FETCH_ERROR = 2
export const POST_ERROR = 3
export const FETCH_OK = 4
export const POST_OK = 5
export const NO_AUTH = 6
export const DELETE_ERROR = 7
export const MICROPUB_NOT_FOUND = 8

const progress_from_upload_event = progressEvent => {
	const loaded = Number(progressEvent?.loaded)
	const total = Number(progressEvent?.total)
	if (!Number.isFinite(loaded) || loaded <= 0) {
		return 0
	}
	if (!Number.isFinite(total) || total <= 0) {
		return 1
	}
	return Math.max(1, Math.min(100, Math.round((loaded * 100) / total)))
}

class MicroPubApi {
  
  async discover_micropub_endpoints(url, alternate_html_match = false) {
    try {
      const response = await fetch(url, {
        headers: { Accept: 'text/html', 'Cache-Control': 'no-cache' }
      })
      const base_url = response.url || url
      const endpoints = {}
      const addLink = (href, rel) => {
        if (!href) {
          return
        }
        for (const name of rel.split(/\s+/)) {
          if (['micropub', 'authorization_endpoint', 'token_endpoint'].includes(name) && !endpoints[name]) {
            endpoints[name] = new URL(href, base_url).href
          }
        }
      }
      // HTTP Link headers take precedence over HTML links.
      const link_header = response.headers.get('Link') || ''
      for (const match of link_header.matchAll(/<([^>]+)>([^,]*)/g)) {
        const rel = match[2].match(/;\s*rel\s*=\s*(?:"([^"]+)"|([^;\s]+))/i)
        if (rel) {
          addLink(match[1], rel[1] || rel[2])
        }
      }
      if (!endpoints.micropub || !endpoints.authorization_endpoint || !endpoints.token_endpoint) {
        const html = await response.text()
        const source = alternate_html_match ? `<html>${html.match(/<head[^>]*>[\s\S]*?<\/head>/i)?.[0] || ''}</html>` : html
        const doc = new DOMParser().parseFromString(source, 'text/html')
        const links = doc.getElementsByTagName('head')[0]?.getElementsByTagName('link') || []
        for (let i = 0; i < links.length; i++) {
          addLink(links[i].getAttribute('href'), links[i].getAttribute('rel') || '')
        }
      }
      if (endpoints.micropub && endpoints.authorization_endpoint && endpoints.token_endpoint) {
        return {
          micropub: endpoints.micropub,
          auth: endpoints.authorization_endpoint,
          token: endpoints.token_endpoint,
          is_wordpress: endpoints.micropub.includes('/wp-json')
        }
      }
      return MICROPUB_NOT_FOUND
    }
    catch (error) {
      console.log(error)
      if (!alternate_html_match) {
        return this.discover_micropub_endpoints(url, true)
      }
      return MICROPUB_NOT_FOUND
    }
  }

  make_auth_url(me_url, base_auth_url) {
    const url = new URL(base_auth_url)
    url.searchParams.set('me', me_url)
    url.searchParams.set('redirect_uri', 'https://micro.blog/indieauth/redirect')
    url.searchParams.set('client_id', 'https://micro.blog/')
    url.searchParams.set('state', Math.floor(Math.random() * 10000).toString())
    url.searchParams.set('scope', 'create update delete')
    url.searchParams.set('response_type', 'code')
    return url.href
  }

  async verify_code(service, auth_url) {
    let auth_code
    try {
      // Decode the callback value before encoding it once in the token request.
      auth_code = new URL(auth_url).searchParams.get('code')
    }
    catch (error) {
      return NO_AUTH
    }

    if (!auth_code) {
      return NO_AUTH
    }

    const params = new URLSearchParams({
      client_id: 'https://micro.blog/',
      code: auth_code,
      redirect_uri: 'https://micro.blog/indieauth/redirect',
      grant_type: 'authorization_code'
    })

    try {
      const response = await axios.post(service.token_endpoint, params.toString(), {
        headers: {
          'Content-type': 'application/x-www-form-urlencoded',
          Accept: 'application/json'
        }
      })
      return response.data.access_token ?? NO_AUTH
    }
    catch (error) {
      console.log(error)
      return FETCH_ERROR
    }
  }

  async get_config(service) {
    try {
      const url = new URL(service.endpoint)
      url.searchParams.set('q', 'config')
      const response = await fetch(url.href, {
        headers: { Authorization: `Bearer ${service.token}`, Accept: 'application/json' }
      })
      if ([400, 404, 405, 501].includes(response.status)) {
        return {}
      }
      if (!response.ok) {
        return FETCH_ERROR
      }
      const config = await response.json().catch(() => ({}))
      return config && typeof config === 'object' && !Array.isArray(config) ? config : {}
    }
    catch (error) {
      console.log(error)
      return FETCH_ERROR
    }
  }

  async sendRequest(service, body, content_type, error_code = POST_ERROR) {
    try {
      const headers = { Authorization: `Bearer ${service.token}` }
      if (content_type) {
        headers['Content-Type'] = content_type
      }
      const response = await fetch(service.endpoint, { method: 'POST', headers, body })
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error?.error_description || `Server error (${response.status}). Please try again later.`)
      }
      const location = response.headers.get('Location')
      return { url: location ? new URL(location, response.url || service.endpoint).href : null }
    }
    catch (error) {
      console.log('MicroPubApi:sendRequest:error', error)
      Alert.alert('Something went wrong.', error.message || 'Please try again later.')
      return error_code
    }
  }

  async send_post(service, content, title = null, assets = [], categories = [], status = null, syndicate_to = null, summary = null) {
    const properties = { content: [content] }
    if (title) {
      properties.name = [title]
    }
    if (status) {
      properties['post-status'] = [status]
    }
    if (categories.length) {
      properties.category = categories
    }
    if (summary) {
      properties.summary = [summary]
    }
    if (service.destination) {
      properties['mp-destination'] = [service.destination]
    }
    if (syndicate_to != null) {
      properties['mp-syndicate-to'] = syndicate_to.length ? syndicate_to : ['']
    }

    let has_files = false
    for (const asset of assets) {
      if (asset.is_inline && !service.is_microblog) {
        continue
      }
      const property = asset.is_video ? 'video' : 'photo'
      let value = asset.remote_url
      if (!asset.did_upload && !service.media_endpoint) {
        has_files = true
        value = { uri: asset.cached_uri || asset.uri, type: asset.type, name: buildUploadFileName(asset, Date.now()) }
      }
      else if (!asset.did_upload || !value) {
        continue
      }
      else if (!asset.is_video && asset.alt_text && !service.is_microblog) {
        value = { value, alt: asset.alt_text }
      }
      if (!properties[property]) {
        properties[property] = []
      }
      properties[property].push(value)
      if (!asset.is_video && service.is_microblog) {
        if (!properties['mp-photo-alt']) {
          properties['mp-photo-alt'] = []
        }
        properties['mp-photo-alt'].push(asset.alt_text || '')
      }
    }

    const needs_json = !has_files && Object.values(properties).some(values => values.some(value => typeof value === 'object'))
    if (needs_json) {
      const params = { type: ['h-entry'], properties }
      for (const key of Object.keys(properties).filter(key => key.startsWith('mp-'))) {
        params[key] = key === 'mp-destination' ? properties[key][0] : properties[key]
        delete properties[key]
      }
      return this.sendRequest(service, JSON.stringify(params), 'application/json')
    }
    const params = has_files ? new FormData() : new URLSearchParams()
    params.append('h', 'entry')
    for (const [key, values] of Object.entries(properties)) {
      for (const value of values) {
        params.append(values.length > 1 ? `${key}[]` : key, value?.value || value)
      }
    }
    return this.sendRequest(service, has_files ? params : params.toString(), has_files ? null : 'application/x-www-form-urlencoded')
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
		const file_name = buildUploadFileName(file, Date.now())
		data.append("file", {
			name: file_name,
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
					file.update_progress(progress_from_upload_event(progressEvent))
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
		const file_name = buildUploadFileName(file, Date.now())
		data.append("file", {
			name: file_name,
			type: file.type,
			uri: file.uri,
		})
		const upload_destination = destination || (App.current_screen_name === "microblog.UploadsScreen" || service.temporary_destination !== null && service.temporary_destination !== service.destination ? service.temporary_destination : service.destination)
		if (upload_destination) {
			data.append("mp-destination", upload_destination)
		}
		console.log('MicroPubApi:upload_media', service, file, data)

		const upload = axios
			.post(service.media_endpoint, data, {
				headers: { Authorization: `Bearer ${ service.token }` },
				timeout: 60000, // 60 second timeout
				onUploadProgress: progressEvent => {
					file.update_progress(progress_from_upload_event(progressEvent))
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

	async upload_chunk(service, payload, cancel_source = null) {
		console.log('MicroPubApi:upload_chunk', payload?.file_id, payload?.file_name)
		if (!service?.media_endpoint) {
			return POST_ERROR
		}
		const base_endpoint = service.media_endpoint.endsWith('/') ? service.media_endpoint.slice(0, -1) : service.media_endpoint
		const endpoint = `${base_endpoint}/append`
		const destination = App.current_screen_name === "microblog.UploadsScreen" || service.temporary_destination !== null && service.temporary_destination !== service.destination ? service.temporary_destination : service.destination
		const data = new FormData()
		data.append('file_id', `${payload.file_id}`)
		data.append('file_name', payload.file_name)
		if (payload.file_type) {
			data.append('file_type', payload.file_type)
		}
		data.append('file_data', payload.file_data)
		if (destination) {
			data.append('mp-destination', destination)
		}

		return axios
			.post(endpoint, data, {
				headers: { Authorization: `Bearer ${ service.token }` },
				timeout: 60000,
				cancelToken: cancel_source?.token
			})
			.then(() => {
				return true
			})
			.catch(error => {
				if (axios.isCancel(error)) {
					console.log('MicroPubApi:upload_chunk:cancelled', payload?.file_id)
					return POST_ERROR
				}
				console.log('MicroPubApi:upload_chunk:error', error?.response?.status, error?.message)
				if (error?.response?.data?.error_description) {
					Alert.alert(
						"Something went wrong.",
						`${error.response.data.error_description}`,
					)
				}
				else {
					Alert.alert(
						"Upload Failed",
						"Could not upload chunk",
					)
				}
				return POST_ERROR
			})
	}

	async finish_upload(service, payload, cancel_source = null) {
		console.log('MicroPubApi:finish_upload', payload?.file_id, payload?.file_name)
		if (!service?.media_endpoint) {
			return POST_ERROR
		}
		const base_endpoint = service.media_endpoint.endsWith('/') ? service.media_endpoint.slice(0, -1) : service.media_endpoint
		const endpoint = `${base_endpoint}/finished`
		const destination = App.current_screen_name === "microblog.UploadsScreen" || service.temporary_destination !== null && service.temporary_destination !== service.destination ? service.temporary_destination : service.destination
		const data = new FormData()
		data.append('file_id', `${payload.file_id}`)
		data.append('file_name', payload.file_name)
		if (payload.file_type) {
			data.append('file_type', payload.file_type)
		}
		if (destination) {
			data.append('mp-destination', destination)
		}

		return axios
			.post(endpoint, data, {
				headers: { Authorization: `Bearer ${ service.token }` },
				timeout: 60000,
				cancelToken: cancel_source?.token
			})
			.then(response => {
				return response.data || {}
			})
			.catch(error => {
				if (axios.isCancel(error)) {
					console.log('MicroPubApi:finish_upload:cancelled', payload?.file_id)
					return POST_ERROR
				}
				console.log('MicroPubApi:finish_upload:error', error?.response?.status, error?.message)
				if (error?.response?.data?.error_description) {
					Alert.alert(
						"Something went wrong.",
						`${error.response.data.error_description}`,
					)
				}
				else {
					Alert.alert(
						"Upload Failed",
						"Could not start processing for the upload",
					)
				}
				return POST_ERROR
			})
	}

	async get_upload_status(service, file_id, cancel_source = null) {
		console.log('MicroPubApi:get_upload_status', file_id)
		if (!service?.media_endpoint) {
			return FETCH_ERROR
		}
		const base_endpoint = service.media_endpoint.endsWith('/') ? service.media_endpoint.slice(0, -1) : service.media_endpoint
		const endpoint = `${base_endpoint}/waiting`
		return axios
			.get(endpoint, {
				headers: { Authorization: `Bearer ${ service.token }` },
				params: { file_id },
				cancelToken: cancel_source?.token
			})
			.then(response => {
				return response.data
			})
			.catch(error => {
				if (axios.isCancel(error)) {
					console.log('MicroPubApi:get_upload_status:cancelled', file_id)
					return FETCH_ERROR
				}
				console.log('MicroPubApi:get_upload_status:error', error?.response?.status, error?.message)
				return FETCH_ERROR
			})
	}

  async send_entry(service, entry, entry_type) {
    const params = new URLSearchParams({ h: 'entry', [entry_type]: entry })
    if (service.destination) {
      params.set('mp-destination', service.destination)
    }
    return this.sendRequest(service, params.toString(), 'application/x-www-form-urlencoded')
  }

  async post_update(service, content, url, title, categories, post_status = '') {
    const replace = { content: [content] }
    const params = { action: 'update', url, replace }
    if (title === null || title === '') {
      params.delete = ['name']
    }
    else if (title !== undefined) {
      replace.name = [title]
    }
    if (categories) {
      replace.category = categories
    }
    if (post_status) {
      replace['post-status'] = [post_status]
    }
    if (service.destination) {
      params['mp-destination'] = service.destination
    }
    return this.sendRequest(service, JSON.stringify(params), 'application/json')
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
    const params = { action: 'delete', url }
    if (service.destination) {
      params['mp-destination'] = service.destination
    }
    return this.sendRequest(service, JSON.stringify(params), 'application/json', DELETE_ERROR)
  }

  async publish_draft(service, content, url, title) {
    const result = await this.post_update(service, content, url, title, undefined, 'published')
    return result === POST_ERROR ? DELETE_ERROR : result
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
    const endpoint = new URL(service.media_endpoint)
    endpoint.searchParams.set('action', 'delete')
    endpoint.searchParams.set('url', url)
    if (service.temporary_destination) {
      endpoint.searchParams.set('mp-destination', service.temporary_destination)
    }
    return this.sendRequest({ ...service, endpoint: endpoint.href }, '', null, DELETE_ERROR)
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
