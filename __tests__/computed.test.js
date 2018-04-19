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
          fullName @computed(value: "$firstName _&_&_ $lastName")
        }
      }
    `,
  });

  expect(response).toMatchSnapshot();
});
