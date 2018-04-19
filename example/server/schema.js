const { makeExecutableSchema } = require('graphql-tools');

const typeDefs = `
  type Permissions {
    name: String!
    expire: String
  }

  type User {
    firstName: String!
    lastName: String!
    permissions: [Permissions]
  }

  type Query {
    me: User
  }
`;

const resolvers = {
  Query: {
    me: () => ({
      firstName: 'John',
      lastName: 'Doe',
    }),
  },
  User: {
    permissions: () => [
      { name: 'ADMIN', expire: '12-12-2018' },
      { name: 'USER', expire: null },
    ],
  },
};

module.exports = makeExecutableSchema({
  typeDefs,
  resolvers,
});
