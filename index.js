const { ApolloLink, Observable } = require('apollo-link');
const set = require('lodash.set');
const get = require('lodash.get');
const flatten = require('lodash.flatten');
const {
  removeDirectivesFromDocument,
  getDirectivesFromDocument,
  hasDirectives,
  getMainDefinition,
  checkDocument,
} = require('apollo-utilities');

class ComputedPropertyLink extends ApolloLink {
  constructor(name = 'computed') {
    super();
    this.directiveName = name;
    this.mainDefinitionName = '';
  }

  _getDirectiveDefinitionFromField(mainDefinitionName, field) {
    if (field.kind === 'Field' && field.selectionSet) {
      return field.selectionSet.selections.map(subField =>
        this._getDirectiveDefinitionFromField(
          `${mainDefinitionName}.${field.name.value}`,
          subField
        )
      );
    }

    return {
      name: `${mainDefinitionName}.${field.name.value}`,
      value: field.directives[0].arguments[0].value.value,
    };
  }

  _getComputedFields(mainDefinition) {
    if (mainDefinition.selectionSet) {
      const definition = mainDefinition.selectionSet.selections[0];

      this.mainDefinitionName = definition.name.value;
      const fieldsFromDocument = definition.selectionSet.selections;

      const mainDefinitionName = definition.name.value;

      return fieldsFromDocument.map(field =>
        this._getDirectiveDefinitionFromField(mainDefinitionName, field)
      );
    }

    return null;
  }

  _hasComputedDirective(doc) {
    checkDocument(doc);

    return hasDirectives([this.directiveName], doc);
  }

  _removeDirective(doc) {
    checkDocument(doc);

    return removeDirectivesFromDocument(
      [{ name: this.directiveName, remove: true }],
      doc
    );
  }

  _getDirectivesFromDoc(doc) {
    checkDocument(doc);

    return getDirectivesFromDocument([{ name: this.directiveName }], doc);
  }

  _getDirectiveSettings(doc) {
    checkDocument(doc);

    const onlyDirectiveDeclaration = this._getDirectivesFromDoc(doc);

    const mainDefinition = getMainDefinition(onlyDirectiveDeclaration);

    return this._getComputedFields(mainDefinition);
  }

  request(operation, forward) {
    if (!this._hasComputedDirective(operation.query)) {
      return forward(operation);
    }

    const directiveSetting = this._getDirectiveSettings(operation.query);

    operation.query = this._removeDirective(operation.query);

    return new Observable(observer => {
      const obs = forward(operation);

      return obs.subscribe({
        next: response => {
          const { data } = response;

          flatten(directiveSetting).forEach(computed => {
            if (!data[computed.name]) {
              set(response, `data.${computed.name}`, computed.value);
            }

            const regexp = /\$(\w+\.)+\w+/g;

            const value = computed.value.replace(
              regexp,
              match => get(data, match.substring(1)) // remove $
            );

            set(response, `data.${computed.name}`, value);
          });

          observer.next(response);
        },
      });
    });
  }
}

module.exports = new ComputedPropertyLink();
