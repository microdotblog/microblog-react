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
export const AUTH_ERROR = 9
export const UNSUPPORTED_PKCE = 10

const CLIENT_ID = 'https://micro.blog/'
const REDIRECT_URI = 'https://micro.blog/indieauth/redirect'

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
  
  async discover_micropub_endpoints(url) {
    const endpoints = await this.discover_endpoints(url, { skip_wordpress: true })
    if (typeof endpoints !== 'object') {
      return endpoints
    }
    return endpoints.micropub && endpoints.auth && endpoints.token ? endpoints : MICROPUB_NOT_FOUND
  }

  async discover_endpoints(url, { alternate_html_match = false, skip_wordpress = false } = {}) {
    let metadata_url
    try {
      const response = await fetch(url, {
        headers: { Accept: 'text/html', 'Cache-Control': 'no-cache' }
      })
      if (!response.ok) {
        return MICROPUB_NOT_FOUND
      }
      const base_url = response.url || url
      const endpoints = {}
      const addLink = (href, rel) => {
        if (!href) {
          return
        }
        for (const name of rel.split(/\s+/)) {
          if (['micropub', 'indieauth-metadata', 'authorization_endpoint', 'token_endpoint'].includes(name) && !endpoints[name]) {
            const resolved = new URL(href, base_url)
            if (['http:', 'https:'].includes(resolved.protocol)) {
              endpoints[name] = resolved.href
            }
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
      // Look for metadata even if all the legacy endpoints were in headers.
      const content_type = response.headers.get('Content-Type') || ''
      if ((!endpoints['indieauth-metadata'] || !endpoints.micropub) && (!content_type || content_type.includes('html'))) {
        const html = await response.text()
        const source = alternate_html_match ? `<html>${html.match(/<head[^>]*>[\s\S]*?<\/head>/i)?.[0] || ''}</html>` : html
        const doc = new DOMParser().parseFromString(source, 'text/html')
        const links = doc.getElementsByTagName('head')[0]?.getElementsByTagName('link') || []
        for (let i = 0; i < links.length; i++) {
          addLink(links[i].getAttribute('href'), links[i].getAttribute('rel') || '')
        }
      }

      let metadata = {}
      const is_wordpress = endpoints.micropub?.includes('/wp-json') || false
      // WordPress setup uses XML-RPC, independently of its IndieAuth metadata.
      metadata_url = skip_wordpress && is_wordpress ? null : endpoints['indieauth-metadata']
      if (metadata_url) {
        const metadata_response = await fetch(metadata_url, { headers: { Accept: 'application/json' } })
        if (!metadata_response.ok) {
          return AUTH_ERROR
        }
        metadata = await metadata_response.json()
        const issuer = new URL(metadata.issuer)
        const auth = new URL(metadata.authorization_endpoint)
        const token = new URL(metadata.token_endpoint)
        if (issuer.protocol !== 'https:' || issuer.search || issuer.hash ||
            !['http:', 'https:'].includes(auth.protocol) || !['http:', 'https:'].includes(token.protocol)) {
          return AUTH_ERROR
        }
        endpoints.authorization_endpoint = auth.href
        endpoints.token_endpoint = token.href
        const methods = metadata.code_challenge_methods_supported
        if (methods != null && !Array.isArray(methods)) {
          return AUTH_ERROR
        }
        if (methods?.length && !methods.includes('S256')) {
          return UNSUPPORTED_PKCE
        }
      }
      if (!endpoints.authorization_endpoint) {
        return MICROPUB_NOT_FOUND
      }
      return {
        micropub: endpoints.micropub,
        auth: endpoints.authorization_endpoint,
        token: endpoints.token_endpoint,
        me: base_url,
        issuer: metadata.issuer || '',
        requires_issuer: metadata.authorization_response_iss_parameter_supported === true,
        supports_pkce: metadata.code_challenge_methods_supported?.includes('S256') || false,
        is_wordpress
      }
    }
    catch (error) {
      console.log('Micropub discovery failed')
      if (metadata_url) {
        return AUTH_ERROR
      }
      if (!alternate_html_match) {
        return this.discover_endpoints(url, { alternate_html_match: true, skip_wordpress })
      }
      return MICROPUB_NOT_FOUND
    }
  }

  make_auth_url(me_url, base_auth_url, authorization) {
    const url = new URL(base_auth_url)
    url.searchParams.set('me', me_url)
    url.searchParams.set('redirect_uri', REDIRECT_URI)
    url.searchParams.set('client_id', CLIENT_ID)
    url.searchParams.set('state', authorization.state)
    url.searchParams.set('scope', 'create update delete')
    url.searchParams.set('response_type', 'code')
    if (authorization.code_challenge) {
      url.searchParams.set('code_challenge', authorization.code_challenge)
      url.searchParams.set('code_challenge_method', 'S256')
    }
    return url.href
  }

  is_auth_callback(raw_url) {
    try {
      const url = new URL(raw_url)
      return url.protocol === 'microblog:' && url.host === 'indieauth' && url.pathname === ''
    }
    catch (error) {
      return false
    }
  }

  async verify_code(authorization, auth_url) {
    if (!this.is_auth_callback(auth_url)) {
      return NO_AUTH
    }
    const callback = new URL(auth_url)
    const state = callback.searchParams.get('state')
    const issuer = callback.searchParams.get('iss')
    // Decode the callback value before encoding it once in the token request.
    const auth_code = callback.searchParams.get('code')
    if (!state || state !== authorization.state || !auth_code || callback.searchParams.has('error')) {
      return NO_AUTH
    }
    if ((authorization.requires_issuer && !issuer) || (authorization.issuer && issuer && issuer !== authorization.issuer)) {
      return NO_AUTH
    }

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      code: auth_code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    })
    if (authorization.code_challenge && !authorization.code_verifier) {
      return NO_AUTH
    }
    if (authorization.code_challenge) {
      params.set('code_verifier', authorization.code_verifier)
    }

    try {
      const response = await fetch(authorization.token_endpoint, {
        method: 'POST',
        body: params.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json'
        }
      })
      if (!response.ok) {
        return FETCH_ERROR
      }
      const data = await response.json()
      return typeof data.access_token === 'string' && data.access_token ? data : NO_AUTH
    }
    catch (error) {
      console.log('Micropub token exchange failed')
      return FETCH_ERROR
    }
  }

  async verify_profile(authorization, me) {
    // Older OAuth servers may omit the IndieAuth profile URL.
    if (me == null) {
      return true
    }
    if (typeof me !== 'string' || !me) {
      return false
    }
    try {
      const profile_url = new URL(me).href
      if (profile_url === authorization.me || profile_url === authorization.profile_url) {
        return true
      }
      const endpoints = await this.discover_endpoints(profile_url)
      return typeof endpoints === 'object' && endpoints.auth === authorization.auth_endpoint &&
        (!authorization.issuer || endpoints.issuer === authorization.issuer)
    }
    catch (error) {
      return false
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
      properties['mp-syndicate-to'] = syndicate_to
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

    const needs_json = !has_files && Object.values(properties).some(values => !values.length || values.some(value => typeof value === 'object'))
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
      // Multipart cannot express [], so retain an explicit empty value for no syndication.
      for (const value of values.length ? values : ['']) {
        params.append(key === 'mp-syndicate-to' || values.length > 1 ? `${key}[]` : key, value?.value || value)
      }
    }
    return this.sendRequest(service, has_files ? params : params.toString(), has_files ? null : 'application/x-www-form-urlencoded')
  }

	async get_categories(service, destination = null) {
		console.log('MicroPubApi:get_categories');
		const config = axios
			.get(service.endpoint, {
				headers: { Authorization: `Bearer ${service.token}` },
				params: { q: "category", "mp-destination": destination || undefined }
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
				params: { q: "syndicate-to", "mp-destination": destination || undefined }
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
		const destination = App.current_screen_name === "microblog.UploadsScreen" ? service.temporary_destination : service.destination
		if (destination) {
			data.append("mp-destination", destination)
		}
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
    if (title !== undefined) {
      replace.name = [title ?? '']
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
			q: "source", "mp-destination": destination || undefined
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
				params: { q: "source", "mp-destination": destination || undefined, "mp-channel": "pages" }
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
				params: { q: "source", "mp-destination": destination || undefined }
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
				params: { q: "source", "mp-destination": destination || undefined, "mp-channel": "collections" }
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
					"mp-destination": destination || undefined,
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
			"mp-destination": service.temporary_destination || undefined,
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
			"mp-destination": service.temporary_destination || undefined,
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
			"mp-destination": service.temporary_destination || undefined,
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
			"mp-destination": service.temporary_destination || undefined,
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
		if (service.temporary_destination) {
			params.append('mp-destination', service.temporary_destination)
		}
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
