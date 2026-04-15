/**
 * API Configuration Constants
 * Contains base URL, endpoints, and timeout configurations for the Reqres.in API
 */

export const API = {
  BASE_URL: 'https://reqres.in/api',
  ENDPOINTS: {
    USERS: '/users',
    REGISTER: '/register',
    LOGIN: '/login',
    RESOURCES: '/unknown',
  },
  TIMEOUTS: {
    GET_RESPONSE: 5000,
    POST_RESPONSE: 3000,
  },
};
