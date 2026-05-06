/**
 * API4 Configuration Constants
 * Contains base URL, endpoints, and timeout configurations for the Reqres.in API
 */

export const API4 = {
  BASE_URL: 'https://api.escuelajs.co/api/v1',
  ENDPOINTS: {
    PROFILE: '/auth/profile',
    AUTH_LOGIN: '/auth/login',
    CATEGORIES: '/categories',
    PRODUCTS: '/products',
  },
  TIMEOUTS: {
    GET_RESPONSE: 5000,
    POST_RESPONSE: 3000,
  },
};