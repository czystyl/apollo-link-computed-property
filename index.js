const { ApolloLink } = require('apollo-link');
const _ = require('lodash');
const { removeDirectivesFromDocument } = require('apollo-utilities');

const genConfigFromDoc = tree =>
  tree.reduce((acc, field) => {
    if (field.kind === 'Field' && field.selectionSet) {
      acc[field.name.value] = genConfigFromDoc(field.selectionSet.selections);
    }

    if (field.directives && field.directives.length > 0) {
      const directive = field.directives
        .find(d => d.name.value === 'computed')
        .arguments.find(arg => arg.name.value === 'value');

      acc[field.name.value] = directive.value.value;
    }

    return acc;
  }, {});

const mapObject = (obj, fn) =>
  _.mapValues(
    obj,
    (v, k) => (_.isObject(v) ? mapObject(v, fn) : fn(v, k, obj))
  );

const setComputedProperty = (val, key, obj, data) => {
  _.set(
    obj,
    key,
    val.replace(/\$(\w+\.)+\w+/g, match =>
      _.get(data, `data.${match.substring(1)}`)
    )
  );
};

const computedLint = new ApolloLink((operation, forwart) => {
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

  return forwart(operation).map(data => {
    mapObject(config, (val, key, obj) => {
      setComputedProperty(val, key, obj, data);
    });

    _.merge(data, { data: config });

    return data;
  });
});

module.exports = computedLint;
