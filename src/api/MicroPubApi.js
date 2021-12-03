import { Alert } from 'react-native';
import axios from 'axios';

export const FETCH_ERROR = 1;
export const POST_ERROR = 2;
export const FETCH_OK = 3
export const POST_OK = 4
export const NO_AUTH = 5

class MicroPubApi {
  
  async get_config(service) {
		console.log('MicroPubApi:get_config', service);
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

	async send_post(service, content, title = null, images = [], categories = []) {
		console.log('MicroBlogApi:send_post', service, content, title, images);
		const params = new FormData()
		params.append('h', 'entry')
		params.append('content', content)
		if (title) {
			params.append('name', title)
		}
		if (images.length) {
			const images_with_url = images.filter(image => image.remote_url !== null && image.did_upload && !image.is_inline)
			if (images_with_url) {
				// Now that we have images, we can append them to our params
				if (images_with_url.length === 1) {
					params.append('photo', images_with_url[0].remote_url)
				}
				else {
					images_with_url.map((image) => {
						params.append('photo[]', image.remote_url)
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
		console.log('MicroPubApi:upload_image', data);
		
		const upload = axios
			.post(service.media_endpoint, data, {
				headers: { Authorization: `Bearer ${service.token}` },
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

}

export default new MicroPubApi()