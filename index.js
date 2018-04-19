const { ApolloLink, Observable } = require('apollo-link');
const set = require('lodash.set');
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

  _getDirectiveDefinitionFromField(field) {
    return {
      name: field.name.value,
      value: field.directives[0].arguments[0].value.value,
    };
  }

  _getComputedFields(mainDefinition) {
    if (mainDefinition.selectionSet) {
      const definition = mainDefinition.selectionSet.selections[0];

      this.mainDefinitionName = definition.name.value;
      const fieldsFromDocument = definition.selectionSet.selections;

      const fields = fieldsFromDocument.map(
        this._getDirectiveDefinitionFromField
      );
      return fields;
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

  _getDirectivesFromDocument(doc) {
    checkDocument(doc);

    return getDirectivesFromDocument([{ name: this.directiveName }], doc);
  }

  request(operation, forward) {
    if (!this._hasComputedDirective(operation.query)) {
      return forward(operation);
    }

    const onlyDirectivesDefinition = this._getDirectivesFromDocument(
      operation.query
    );

    const mainDefinition = getMainDefinition(onlyDirectivesDefinition);

    const computed = this._getComputedFields(mainDefinition);

    operation.query = this._removeDirective(operation.query);

    return new Observable(observer => {
      const obs = forward(operation);

      return obs.subscribe({
        next: response => {
          const data = response.data[this.mainDefinitionName];

          for (const resField in data) {
            if (Object.prototype.hasOwnProperty.call(data, resField)) {
              computed.forEach(computedField => {
                if (!data[computedField.name]) {
                  set(
                    response,
                    `data.${this.mainDefinitionName}.${computedField.name}`,
                    computedField.value
                  );
                }

                // Replace string
                const value = data[computedField.name].replace(
                  `$${resField}`,
                  data[resField]
                );

                set(
                  response,
                  `data.${this.mainDefinitionName}.${computedField.name}`,
                  value
                );
              });
            }
          }

          observer.next(response);
        },
      });
    });
  }
}

module.exports = new ComputedPropertyLink();
