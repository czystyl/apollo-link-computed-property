const { makeExecutableSchema } = require('graphql-tools');

const typeDefs = `
  type Key {
    to: String!
    code: Int!
  }

  type Permissions {
    name: String!
    from: String!
    to: String
    keys: [Key]
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
      {
        name: 'ADMIN',
        from: '12-12-2018',
        to: null,
        keys: [{ to: 'front-door', code: 6 }, { to: 'room-2', code: 32 }],
      },
      {
        name: 'USER',
        from: '20-02-2018',
        to: '12-12-2018',
        keys: [{ to: 'back-door', code: 3 }, { to: 'room-1', code: 111 }],
      },
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
