const { ApolloLink } = require('apollo-link');
const _ = require('lodash');
const { removeDirectivesFromDocument } = require('apollo-utilities');
const { mapObject, genConfigFromDoc, setComputedProperty } = require('./utils');

const computedLink = new ApolloLink((operation, forward) => {
  const operationDefinition = _.get(operation, 'query.definitions').find(
    definition => definition.kind === 'OperationDefinition'
  );

  const config = genConfigFromDoc(
    _.get(operationDefinition, ['selectionSet', 'selections'])
  );

  operation.query = removeDirectivesFromDocument(
    [{ name: 'computed', remove: true }],
    operation.query
  );

  return forward(operation).map(response => {
    mapObject(config, (val, key, obj) => {
      setComputedProperty(val, key, obj, response);
    });

    _.merge(response, { data: config });

    return response;
  });
});

module.exports = computedLink;
