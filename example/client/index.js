const gql = require('graphql-tag');
const client = require('./client');

client.query({
  query: gql`
    {
      me {
        firstName
        lastName
        fullName @computed(value: "$firstName && $lastName")
      }
    }
  `,
});
