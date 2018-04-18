const { makeExecutableSchema } = require('graphql-tools');

const typeDefs = `
  type User {
    firstName: String
    lastName: String
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
};

module.exports = makeExecutableSchema({
  typeDefs,
  resolvers,
});
