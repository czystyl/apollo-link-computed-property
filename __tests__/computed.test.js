const { graphql } = require('graphql');
const nock = require('nock');
const schema = require('../example/server/schema');

beforeAll(() => {
  nock.disableNetConnect();
});

afterEach(() => {
  nock.cleanAll();
});

afterAll(() => {
  nock.enableNetConnect();
});

test('if scheam works', async () => {
  nock.recorder.rec();

  const response = await graphql(
    schema,
    `
      query {
        me {
          firstName
          lastName
        }
      }
    `
  );

  expect(response).toMatchSnapshot();
});
