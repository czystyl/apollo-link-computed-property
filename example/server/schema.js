const { makeExecutableSchema } = require('graphql-tools');

const typeDefs = `
  type Permissions {
    name: String!
    expire: String
  }

  type Department {
    name: String!
    code: Int!
  }

  type User {
    firstName: String!
    lastName: String!
    permissions: [Permissions]
    department: Department
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
    department: () => ({
      name: 'Security',
      code: 1111,
    }),
  },
};

module.exports = makeExecutableSchema({
  typeDefs,
  resolvers,
});
