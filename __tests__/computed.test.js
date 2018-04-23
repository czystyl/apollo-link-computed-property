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
