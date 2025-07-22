const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const API_ROUTES = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  GET_USERS: `${API_BASE_URL}/users`,
  GET_USER_ME: `${API_BASE_URL}/users/get-me`,
  CREATE_USER: `${API_BASE_URL}/users/create-user`,
  UPDATE_USER: `${API_BASE_URL}/users/update-user`,
  DELETE_USER: `${API_BASE_URL}/users/delete-user`,
};

export const GRAPHQL_ROUTES = {
  GRAPHQL_API_URL: `${API_BASE_URL}/graphql`,
};
