const { ApolloClient } = require('apollo-client');
const { InMemoryCache } = require('apollo-cache-inmemory');
const { ApolloLink } = require('apollo-link');
const { createHttpLink } = require('apollo-link-http');
const ComputedPropertyLink = require('../../index');
const fetch = require('node-fetch');

const httpLink = createHttpLink({
  uri: 'http://localhost:3003/graphql',
  fetch,
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([ComputedPropertyLink, httpLink]),
});

module.exports = client;
