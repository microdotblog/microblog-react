import axios from 'axios';
import Auth from './../stores/Auth';

export const API_URL = 'https://micro.blog';
export const APP_NAME = 'Micro.blog for Android';
export const REDIRECT_URL = 'microblog://signin/';
export const LOGIN_INCORRECT = 1;
export const LOGIN_ERROR = 2;
export const LOGIN_SUCCESS = 3;
export const LOGIN_TOKEN_INVALID = 4;
export const API_ERROR = 5;
export const POST_ERROR = 6;
export const BOOKMARK_ERROR = 7;

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
          app_name: APP_NAME,
          redirect_url: REDIRECT_URL
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

  async add_bookmark(id) {
		console.log('MicroBlogApi:add_bookmark', id);
		const bookmark = axios
			.post(`/posts/favorites`, '', {
				headers: { Authorization: `Bearer ${Auth.selected_user?.token()}` },
				params: { id: id }
			})
			.then(() => {
				return true;
			})
			.catch(error => {
				console.log(error);
				return BOOKMARK_ERROR;
			});
		return bookmark;
	}

	async remove_bookmark(id) {
		console.log('MicroBlogApi:remove_bookmark', id);
		const bookmark = axios
			.delete(`/posts/favorites/${id}`, {
				headers: { Authorization: `Bearer ${Auth.selected_user?.token()}` }
			})
			.then(() => {
				return true;
			})
			.catch(error => {
				console.log(error);
				return BOOKMARK_ERROR;
			});
		return bookmark;
	}
  
}

export default new MicroBlogApi()