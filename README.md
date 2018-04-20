# apollo-link-computed-property

## This project is under heavy active development !!

[![Version][version-badge]][package]
[![downloads][downloads-badge]][npmtrends]
[![PRs Welcome][prs-badge]][prs]
[![MIT License][license-badge]][build]

## Introduction

Apollo link for `@computed` directive support on client side.

> Check this directive for the [server](https://github.com/czystyl/apollo-link-computed-property) side.

# Table of Contents

* [Introduction](#introduction)
* [Installation](#installation)
* [Usage](#Usage)
* [Parameters](#parameters)
* [Contributing](#contributing)
* [TODO](#todo)
* [LICENSE](#license)

# Installation

```
yarn add apollo-link-computed-property
```

_This package requires [apollo-client](https://www.npmjs.com/package/apollo-client) as peer dependency_

# Usage

```js
const httpLink = createHttpLink({ uri: 'http://you-graphql-server/graphql' });

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([ComputedPropertyLink, httpLink]),
});
```

Query:

```js
client.query({
  query: gql`
    {
      me {
        firstName
        lastName
        fullName @computed(value: "$firstName $lastName")
      }
    }
  `,
});
```

# Directive Parameters

Directive params:

### `value`: String

The computed value. It can contain fields defined within the current type.

Example:

`@computed(value: "$firstName $lastName")`
`@computed(value: "$price $")`

## Contributing

I would love to see your contribution. ❤️

For local development (and testing), all you have to do is to run `yarn` and then run server `yarn start:server` and client `yarn start:client`.
That will start the Apollo server with client and you are ready to contribute :tada:

Run yarn test (try `--watch` flag) for unit tests (we are using Jest)

## TODO:

* [ ] Add types
* [ ] Support for computing nested fields
* [ ] Support fragments

# LICENSE

The MIT License (MIT) 2018 - Luke Czyszczonik - <mailto:lukasz.czyszczonik@gmail.com>

[npm]: https://www.npmjs.com/
[node]: https://nodejs.org
[build-badge]: https://img.shields.io/travis/czystyl/apollo-link-computed-property.svg?style=flat-square
[build]: https://travis-ci.org/graphql-community/graphql-directive-computed-property
[coverage-badge]: https://img.shields.io/codecov/c/github/graphql-community/graphql-directive-computed-property.svg?style=flat-square
[coverage]: https://codecov.io/github/czystyl/apollo-link-computed-property
[version-badge]: https://img.shields.io/npm/v/graphql-directive-computed-property.svg?style=flat-square
[package]: https://www.npmjs.com/package/graphql-directive-computed-property
[downloads-badge]: https://img.shields.io/npm/dm/graphql-directive-computed-property.svg?style=flat-square
[npmtrends]: http://www.npmtrends.com/graphql-directive-computed-property
[license-badge]: https://img.shields.io/npm/l/graphql-directive-computed-property.svg?style=flat-square
[license]: https://github.com/czystyl/apollo-link-computed-property/blob/master/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[donate-badge]: https://img.shields.io/badge/$-support-green.svg?style=flat-square
[coc-badge]: https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square
[coc]: https://github.com/czystyl/apollo-link-computed-property/blob/master/CODE_OF_CONDUCT.md
