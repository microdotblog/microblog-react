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
    console.log('MicroBlogApi:login_with_email', email);
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
        console.log("MicroBlogApi:login_with_email:response", response)
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
				return FETCH_ERROR;
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
  
  async send_reply(id, content) {
		console.log('MicroBlogApi:send_reply', id, content);
		const reply = axios
			.post(`/posts/reply`, "" ,{
				headers: { Authorization: `Bearer ${Auth.selected_user?.token()}` },
				params: {
					id: id,
					content: content
				}
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
  
}

export default new MicroBlogApi()