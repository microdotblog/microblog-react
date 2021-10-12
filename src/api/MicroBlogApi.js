import axios from 'axios';

export const API_URL = 'https://micro.blog';
export const APP_NAME = 'Micro.blog for Android';
export const REDIRECT_URL = 'microblog://signin/';
export const LOGIN_INCORRECT = 1;
export const LOGIN_ERROR = 2;
export const LOGIN_SUCCESS = 3;
export const LOGIN_TOKEN_INVALID = 4;

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
    console.log('MicroBlogApi:login_with_email');
    const login = axios
      .post('/account/signin', '', {
        params: {
          email: email,
          app_name: APP_NAME,
          redirect_url: REDIRECT_URL
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
}

export default new MicroBlogApi()