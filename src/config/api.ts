// const API_BASE_URL = process.env.API_BASE_URL;
// const GRAPHQL_API_URL = process.env.GRAPHQL_API_URL;
const API_BASE_URL = 'http://localhost:8080';
const GRAPHQL_API_URL = 'http://localhost:4000';

export const API_ROUTES = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  GET_USERS: `${API_BASE_URL}/users`,
  GET_USER_ME: `${API_BASE_URL}/users/me`,
};

export const GRAPHQL_ROUTES = {
  GRAPHQL_API_URL: `${GRAPHQL_API_URL}/graphql`,
};
