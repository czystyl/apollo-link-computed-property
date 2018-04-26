const gql = require('graphql-tag');
const client = require('./client');

client
  .query({
    query: gql`
      query {
        me {
          firstName
          lastName
          fullName @computed(value: "$me.firstName && $me.lastName")
          department {
            access
              @computed(
                value: "Access to $me.department.name: $me.department.code"
              )
            name
            code
          }
        }
      }
    `,
  })
  .then(console.log)
  .catch(console.log);
