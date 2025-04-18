import { ApolloClient, InMemoryCache } from '@apollo/client';
import { GRAPHQL_ROUTES } from '../config/api';

const client = new ApolloClient({
  uri: GRAPHQL_ROUTES.GRAPHQL_API_URL, // or your deployed URL
  cache: new InMemoryCache(),
});

export default client;
