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

      return fieldsFromDocument.map(this._getDirectiveDefinitionFromField);
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
          const data = response.data[this.mainDefinitionName];

          for (const resField in data) {
            if (Object.prototype.hasOwnProperty.call(data, resField)) {
              directiveSetting.forEach(computed => {
                if (!data[computed.name]) {
                  set(
                    response,
                    `data.${this.mainDefinitionName}.${computed.name}`,
                    computed.value
                  );
                }

                const value = data[computed.name].replace(
                  `$${resField}`,
                  data[resField]
                );

                set(
                  response,
                  `data.${this.mainDefinitionName}.${computed.name}`,
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
