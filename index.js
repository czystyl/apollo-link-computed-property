const { ApolloLink, Observable } = require('apollo-link');
const {
  removeDirectivesFromDocument,
  getDirectivesFromDocument,
  hasDirectives,
} = require('apollo-utilities');

class ComputedPropertyLink extends ApolloLink {
  request(operation, forward) {
    const isComputedQuery = hasDirectives(['computed'], operation.query);

    if (!isComputedQuery) {
      return forward(operation);
    }

    const newQuery = removeDirectivesFromDocument(
      [{ name: 'computed', remove: true }],
      operation.query
    );
    // @TODO: handle directive from query
    // const dir = getDirectivesFromDocument(
    //   [{ name: 'computed' }],
    //   operation.query
    // );
    //
    // const directives =
    //   dir.definitions[0].selectionSet.selections[0].selectionSet.selections[0]
    //     .directives;
    //
    // console.log(directives); //

    operation.query = newQuery;

    return new Observable(observer => {
      const obs = forward(operation);

      return obs.subscribe({
        next: response => {
          observer.next(response);
        },
      });
    });
  }
}

module.exports = new ComputedPropertyLink();
