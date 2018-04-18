const gql = require('graphql-tag');
const client = require('./client');

client
  .query({
    query: gql`
      {
        me {
          firstName
          lastName
          fullName @computed(value: "$firstName && $lastName")
        }
      }
    `,
  })
  .then(result => {
    console.log('__RESULT__:\n', result);
  })
  .catch(e => {
    console.log('__ERROR__:\n', e);
  });
