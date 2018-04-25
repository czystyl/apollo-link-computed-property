const nock = require('nock');
const client = require('../example/client/client');
const gql = require('graphql-tag');

beforeAll(() => {
  nock.disableNetConnect();
});

afterEach(() => {
  nock.cleanAll();
});

afterAll(() => {
  nock.enableNetConnect();
});

test('return computed property', async () => {
  nock('http://localhost:3003', { encodedQueryParams: true })
    .post('/graphql', {
      operationName: null,
      variables: {},
      query: '{\n  me {\n    firstName\n    lastName\n    __typename\n  }\n}\n',
    })
    .reply(200, {
      data: {
        me: { firstName: 'John', lastName: 'Doe', __typename: 'User' },
      },
    });

  const response = await client.query({
    query: gql`
      {
        me {
          firstName
          lastName
          fullName @computed(value: "$me.firstName _&_&_ $me.lastName")
        }
      }
    `,
  });

  expect(response).toMatchSnapshot();
});

test('return computed property for nested type', async () => {
  nock('http://localhost:3003', { encodedQueryParams: true })
    .post('/graphql', {
      operationName: null,
      variables: {},
      query:
        '{\n  me {\n    firstName\n    lastName\n    department {\n      name\n      code\n      __typename\n    }\n    __typename\n  }\n}\n',
    })
    .reply(200, {
      data: {
        me: {
          firstName: 'John',
          lastName: 'Doe',
          department: {
            name: 'Security',
            code: 1111,
            __typename: 'Department',
          },
          __typename: 'User',
        },
      },
    });

  const response = await client.query({
    query: gql`
      {
        me {
          firstName
          lastName
          fullName @computed(value: "$me.firstName $me.lastName")
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
  });

  expect(response.data.me.fullName).toEqual('John Doe');
  expect(response.data.me.department.access).toEqual(
    'Access to Security: 1111'
  );
  expect(response).toMatchSnapshot();
});

test('computed property with fragments', async () => {
  nock('http://localhost:3003', { encodedQueryParams: true })
    .post('/graphql')
    .reply(200, {
      data: {
        me: { firstName: 'John', lastName: 'Doe', __typename: 'User' },
      },
    });

  const response = await client.query({
    query: gql`
      query {
        me {
          ...Name
          fullName @computed(value: "$me.firstName $me.lastName")
        }
      }

      fragment Name on User {
        firstName
        lastName
      }
    `,
  });

  expect(response).toMatchSnapshot();
});

test.skip('return computed property for nested array type', async () => {
  nock('http://localhost:3003', { encodedQueryParams: true })
    .post('/graphql')
    .reply(200, {
      data: {
        me: {
          firstName: 'John',
          lastName: 'Doe',
          department: { code: 1111, __typename: 'Department' },
          permissions: [
            {
              name: 'ADMIN',
              from: '12-12-2018',
              to: null,
              __typename: 'Permissions',
            },
            {
              name: 'USER',
              from: '20-02-2018',
              to: '12-12-2018',
              __typename: 'Permissions',
            },
          ],
          __typename: 'User',
        },
      },
    });

  const response = await client.query({
    query: gql`
      {
        me {
          firstName
          lastName
          department {
            code
          }
          permissions {
            keys {
              to
              code
              help
                @computed(
                  value: "User $me.permissions.keys.code to open $me.permissions.keys.to"
                )
            }
            name
            from
            to
            text
              @computed(
                value: "$me.firstName are to $me.permissions.name from: $me.permissions.from to: $me.permissions.to"
              )
          }
        }
      }
    `,
  });

  expect(response).toMatchSnapshot();
});
