const mapValues = require('lodash/mapValues');
const set = require('lodash/set');
const get = require('lodash/get');
const isObject = require('lodash/isObject');

const mapObject = (obj, fn) =>
  mapValues(obj, (v, k) => (isObject(v) ? mapObject(v, fn) : fn(v, k, obj)));

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

const setComputedProperty = (val, key, obj, data) => {
  set(
    obj,
    key,
    val.replace(/\$(\w+\.)+\w+/g, match =>
      get(data, `data.${match.substring(1)}`)
    )
  );
};

module.exports = {
  mapObject,
  genConfigFromDoc,
  setComputedProperty,
};
