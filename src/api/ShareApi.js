import axios from 'axios';

export const MB_API_URL = 'https://micro.blog';
export const LOGIN_INCORRECT = 1;
export const LOGIN_ERROR = 2;
export const LOGIN_SUCCESS = 3;
export const LOGIN_TOKEN_INVALID = 4;
export const API_ERROR = 5;
export const POST_ERROR = 6;
export const BOOKMARK_ERROR = 7;

class ShareApi {
  
  async login_with_token(token) {
    console.log('ShareApi:login_with_token');
    const login = axios
      .post(`${MB_API_URL}/account/verify`, '', {
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
  
}

export default new ShareApi()