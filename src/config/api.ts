const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
// const GRAPHQL_API_URL = process.env.GRAPHQL_API_URL;
// const API_BASE_URL = 'http://localhost:8080';
//const API_BASE_URL = 'https://tablettopcafe-htd5dzczd6hbaud9.southeastasia-01.azurewebsites.net/';

export const API_ROUTES = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  GET_USERS: `${API_BASE_URL}/users`,
  GET_USER_ME: `${API_BASE_URL}/users/me`,
};

export const GRAPHQL_ROUTES = {
  GRAPHQL_API_URL: `${API_BASE_URL}/graphql`,
};
