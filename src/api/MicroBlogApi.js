import axios from 'axios';
import { Platform } from 'react-native'
import Auth from './../stores/Auth';

export const API_URL = 'https://micro.blog';
export const APP_NAME = Platform.OS === 'ios' ? 'Micro.blog for iOS' : 'Micro.blog for Android';
export const REDIRECT_URL = 'microblog://signin/';
export const LOGIN_INCORRECT = 1;
export const LOGIN_ERROR = 2;
export const LOGIN_SUCCESS = 3;
export const LOGIN_TOKEN_INVALID = 4;
export const API_ERROR = 5;
export const POST_ERROR = 6;
export const BOOKMARK_ERROR = 7;
export const REPORTING_ERROR = 8;
export const MUTING_ERROR = 9;
export const DELETE_ERROR = 10;
export const DUPLICATE_REPLY = 11;
export let CURRENT_REPLY_ID = 0;

axios.defaults.baseURL = API_URL;

class MicroBlogApi {
  
  async login_with_token(token) {
    console.log('MicroBlogApi:login_with_token');
    const login = axios
      .post('/account/verify', '', {
        params: {
          token: token
        }
      })
      .then(response => {
        if (response.data.error) {
          return LOGIN_TOKEN_INVALID
        } else {
          return response.data
        }
      })
      .catch(error => {
        console.log(error)
        return LOGIN_ERROR
      });
    return login
  }

  async login_with_email(email) {
    const login = axios
      .post('/account/signin', '', {
        params: {
					email: email,
					redirect_url: REDIRECT_URL,
					...Platform.select({
						android: {
							app_name: APP_NAME
						},
						ios: {
							is_mobile: 1,
						}
					})
        }
      })
      .then(response => {
        if (response.data.error) {
          return LOGIN_INCORRECT
        } else {
          return LOGIN_SUCCESS
        }
      })
      .catch(error => {
        console.log(error)
        return LOGIN_ERROR
      });
    return login
  }
  
  async get_profile(username) {
    console.log('MicroBlogApi:get_profile', username);
    const login = axios
      .get(`/posts/${username}`, {
        headers: { Authorization: `Bearer ${Auth.selected_user?.token()}` },
        params: { count: 0 }
      })
      .then(response => {
        console.log("MicroBlogApi:get_profile:response", response.data)
        return response.data
      })
      .catch(error => {
        console.log(error)
        return API_ERROR
      });
    return login
  }
  
  async follow_user(username) {
		console.log('MicroBlogApi: follow_user', username);
		const follow = axios
			.post(`/users/follow`, '', {
				headers: { Authorization: `Bearer ${Auth.selected_user?.token()}` },
				params: { username: username }
			})
			.then(() => {
				return true;
			})
			.catch(error => {
				console.log(error);	
				return API_ERROR;
			});
		return follow;
	}
  
  async unfollow_user(username) {
		console.log('MicroBlogApi: unfollow_user', username);
		const unfollow = axios
			.post(`/users/unfollow`, '', {
				headers: { Authorization: `Bearer ${Auth.selected_user?.token()}` },
				params: { username: username }
			})
			.then(() => {
				return true;
			})
			.catch(error => {
				console.log(error);
				return POST_ERROR;
			});
		return unfollow;
  }
  
  async get_discover_timeline() {
    console.log('MicroBlogApi:get_discover_timeline');
    const discover = axios
      .get(`/posts/discover`, {
        params: { count: 0 }
      })
      .then(response => {
        return response.data?._microblog?.tagmoji
      })
      .catch(error => {
        console.log(error)
        return API_ERROR
      });
    return discover
  }

  async get_conversation(id) {
		console.log('MicroBlogApi:get_conversation', id);
		const conversation = axios
			.get(`/posts/conversation`, {
				headers: { Authorization: `Bearer ${Auth.selected_user?.token()}` },
				params: { id: id }
			})
			.then(response => {
				return response.data;
			})
			.catch(error => {
				console.log(error);
				return API_ERROR;
			});
		return conversation;
  }
  
  async send_reply(id, content, reply_id) {
		console.log('MicroBlogApi:send_reply', id, content, reply_id);
		if(CURRENT_REPLY_ID === reply_id){
			return DUPLICATE_REPLY
		}
		CURRENT_REPLY_ID = reply_id				

		const params = new FormData();
		params.append("id", id);
		params.append("content", content);

		const reply = axios
			.post('/posts/reply', params, {
				headers: { Authorization: `Bearer ${Auth.selected_user?.token()}` }
			})
			.then(() => {
				return true;
			})
			.catch(error => {
				console.log(error);
				return POST_ERROR;
			});
		return reply;
  }

  async report_user(username) {
		console.log('MicroBlogApi: report_user', username);
		const report = axios
			.post(`/users/report`, '', {
				headers: { Authorization: `Bearer ${Auth.selected_user?.token()}` },
				params: { username: username }
			})
			.then(() => {
				return true;
			})
			.catch(error => {
				console.log(error);	
				return REPORTING_ERROR;
			});
		return report;
  }
  
  async get_muted_users(token) {
		console.log('MicroBlogApi:get_muted_users');
		const muted_users = axios
			.get(`/users/muting`, {
				headers: { Authorization: `Bearer ${token}` }
			})
			.then(response => {
				return response.data;
			})
			.catch(error => {
				console.log(error);
				return API_ERROR;
			});
		return muted_users;
  }

  async mute_user(username, token) {
		console.log('MicroBlogApi: mute_user', username);
		const mute = axios
			.post(`/users/mute`, '', {
				headers: { Authorization: `Bearer ${token}` },
				params: { username: username }
			})
			.then((response) => {
				return response.data;
			})
			.catch(error => {
				console.log(error);	
				return MUTING_ERROR;
			});
		return mute;
  }

  async unmute_user(id, token) {
		console.log('MicroBlogApi:unmute_user');
		const unmute = axios
			.delete(`/users/muting/${id}`, {
				headers: { Authorization: `Bearer ${token}` }
			})
			.then(response => {
				return true;
			})
			.catch(error => {
				console.log(error);
				return API_ERROR;
			});
		return unmute;
	}
	
	async register_push(push_token, user_token) {
		console.log('MicroBlogApi:register_push', push_token);
		const push = axios
			.post(`/users/push/register`, "" ,{
				headers: { Authorization: `Bearer ${user_token}` },
				params: {
					device_token: push_token,
					push_env: Platform.OS === 'ios' ? __DEV__ ? "dev" : "prod" : "production",
					...Platform.select({
						android: {
							app_name: APP_NAME
						}
					})
				}
			})
			.then(response => {
				console.log('MicroBlogApi:register_push:data', response.data);
				return true;
			})
			.catch(error => {
				console.log(error);
				return API_ERROR;
			});
		return push;
	}

	async unregister_push(push_token, user_token) {
		console.log('MicroBlogApi: unregister_push', push_token);
		const push = axios
			.post(`/users/push/unregister`, "" ,{
				headers: { Authorization: `Bearer ${user_token}` },
				params: {
					device_token: push_token,
					push_env: Platform.OS === 'ios' ? __DEV__ ? "dev" : "prod" : "production",
					...Platform.select({
						android: {
							app_name: APP_NAME
						}
					})
				}
			})
			.then(response => {
				console.log('MicroBlogApi:unregister_push:data', response.data);
				return true;
			})
			.catch(error => {
				console.log(error);
				return API_ERROR;
			});
		return push;
	}
	
	async get_replies() {
		console.log('MicroBlogApi: get_replies');
		const push = axios
			.get(`/posts/replies`, {
				headers: { Authorization: `Bearer ${Auth.selected_user?.token()}` },
			})
			.then(response => {
				if(response.data != null){
					return response.data
				}
				return API_ERROR;
			})
			.catch(error => {
				console.log('MicroBlogApi: get_replies', error);
				return API_ERROR;
			});
		return push;
	}
	
	async delete_post(id) {
		console.log('MicroBlogApi:delete_post', id);
		const posts = axios
			.delete(`/posts/${id}`, {
				headers: { Authorization: `Bearer ${Auth.selected_user?.token()}` }
			})
			.then(response => {
				return response.data;
			})
			.catch(error => {
				console.log(error);
				return DELETE_ERROR;
			});
		return posts;
	}

	async find_users(username) {
		console.log('MicroBlogApi: find_users', username);
		const push = axios
			.get(`/micropub?q=contact&filter=${username}`, {
				headers: { Authorization: `Bearer ${Auth.selected_user?.token()}` },
			})
			.then(response => {
				if(response.data != null){
					return response.data
				}
				return API_ERROR;
			})
			.catch(error => {
				console.log('MicroBlogApi: find_users', error);
				return API_ERROR;
			});
		return push;
	}
	
	async search_posts_and_pages(query, destination = null, is_pages = false) {
		console.log('MicroBlogApi: search_posts_and_pages', query, destination, is_pages);
		const search = axios
			.get(`/micropub?q=source&mp-destination=${destination}&filter=${query}${is_pages ? "&mp-channel=pages" : ""}`, {
				headers: { Authorization: `Bearer ${Auth.selected_user?.token()}` },
			})
			.then(response => {
				if(response.data != null){
					return response.data
				}
				return API_ERROR;
			})
			.catch(error => {
				console.log('MicroBlogApi: search_posts_and_pages', error);
				return API_ERROR;
			});
		return search;
	}

	async search_uploads(query, destination = null) {
		console.log('MicroBlogApi: search_uploads', query, destination);
		const search = axios
			.get(`/micropub/media?q=source&mp-destination=${destination}&filter=${query}`, {
				headers: { Authorization: `Bearer ${Auth.selected_user?.token()}` },
			})
			.then(response => {
				if(response.data != null){
					return response.data
				}
				return API_ERROR;
			})
			.catch(error => {
				console.log('MicroBlogApi: search_uploads', error);
				return API_ERROR;
			});
		return search;
	}
	
	async bookmark_highlights() {
		console.log('MicroBlogApi: bookmark_highlights');
		const highlights = axios
			.get(`/posts/bookmarks/highlights`, {
				headers: { Authorization: `Bearer ${Auth.selected_user?.token()}` },
			})
			.then(response => {
				if(response.data != null){
					return response.data
				}
				return API_ERROR;
			})
			.catch(error => {
				console.log('MicroBlogApi: bookmark_highlights', error);
				return API_ERROR;
			});
		return highlights;
	}
	
	async delete_highlight(id) {
		console.log('MicroBlogApi:delete_highlight', id);
		const data = axios
			.delete(`/posts/bookmarks/highlights/${id}`, {
				headers: { Authorization: `Bearer ${Auth.selected_user?.token()}` }
			})
			.then(response => {
				return response.data;
			})
			.catch(error => {
				console.log(error);
				return DELETE_ERROR;
			});
		return data;
	}
	
	async bookmark_tags() {
		console.log('MicroBlogApi: bookmark_tags');
		const data = axios
			.get(`/posts/bookmarks/tags`, {
				headers: { Authorization: `Bearer ${Auth.selected_user?.token()}` },
			})
			.then(response => {
				if(response.data != null){
					return response.data
				}
				return API_ERROR;
			})
			.catch(error => {
				console.log('MicroBlogApi: bookmark_tags', error);
				return API_ERROR;
			});
		return data;
	}
	
	async bookmark_recent_tags(count = 10) {
		// Would be nice to have this optional in the above command.
		// One day I'd like to work on a bit on more DRY'ness.
		console.log('MicroBlogApi: bookmark_recent_tags');
		const data = axios
			.get(`/posts/bookmarks/tags?recent=1&count=${count}`, {
				headers: { Authorization: `Bearer ${Auth.selected_user?.token()}` },
			})
			.then(response => {
				if(response.data != null){
					return response.data
				}
				return API_ERROR;
			})
			.catch(error => {
				console.log('MicroBlogApi: bookmark_recent_tags', error);
				return API_ERROR;
			});
		return data;
	}
	
	async bookmark_by_id(id) {
		console.log('MicroBlogApi: bookmark_by_id', id);
		const data = axios
			.get(`/posts/bookmarks/${id}`, {
				headers: { Authorization: `Bearer ${Auth.selected_user?.token()}` },
			})
			.then(response => {
				if(response.data != null){
					return response.data
				}
				return API_ERROR;
			})
			.catch(error => {
				console.log('MicroBlogApi: bookmark_by_id', error);
				return API_ERROR;
			});
		return data;
	}
	
	async save_tags_for_bookmark_by_id(id, tags) {
		console.log('MicroBlogApi: save_tags_for_bookmark_by_id', id, tags);
		const data = axios
			.post(`/posts/bookmarks/${id}`, "", {
				headers: { Authorization: `Bearer ${Auth.selected_user?.token()}` },
				params: {
					tags: tags
				}
			})
			.then(response => {
				if(response.data != null){
					return response.data
				}
				return API_ERROR;
			})
			.catch(error => {
				console.log('MicroBlogApi: save_tags_for_bookmark_by_id', error);
				return API_ERROR;
			});
		return data;
	}
  
}

export default new MicroBlogApi()