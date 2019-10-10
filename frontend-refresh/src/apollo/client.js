import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory'

import fp from 'lodash/fp'
import { memoize } from 'lodash'

const HOSTNAME = process.env['REACT_APP_HOSTNAME_GRAPHQL']

const client = new ApolloClient({
  link: new HttpLink({ uri: `${HOSTNAME}/api/graphiql` }),
  cache: new InMemoryCache()
})

export default client

let clients = {}

export const getClientWithAuth = (token) => {
  const clientCandidate = clients[token]
  if (!clientCandidate) {
    clients[token] = clientWithAuth(token)
  }
  return clients[token]
}

const clientWithAuth = (token) => (
  new ApolloClient({
    link: setContext((_, prevContext) => ({
      headers: {
          ...prevContext.headers,
          'authorization': token ? `Bearer ${token}` : '',
      }
  })).concat(new HttpLink({ uri: `${HOSTNAME}/api/graphiql` })),
    cache: new InMemoryCache()
  })
)

const addProps = f => initialProps => ({
  ...initialProps,
  ...f(initialProps),
})

export const paginated = (connectionPath, dataPath = 'data') => {
  const generateNextPage =
    memoize((endCursor, hasNextPage, fetchMore) =>
      memoize(() =>
        !hasNextPage
          ? Promise.resolve(null)
          : fetchMore({
            variables: { after: endCursor },
            updateQuery: (previousResult, { fetchMoreResult }) =>
              fp.assoc(
                `${connectionPath}.edges`,
                fp.flatMap(
                  fp.get(`${connectionPath}.edges`),
                  [previousResult, fetchMoreResult],
                ),
                fetchMoreResult,
              ),
          })
      )
    )

  return fp.update(dataPath, data => {
    if (data.networkStatus === 1 || data.networkStatus === 4) {
      generateNextPage.cache.clear()
    }
    return fp.update(
      `${connectionPath}.pageInfo`,
      addProps((pageInfo) => !pageInfo ? {} : {
        nextPage: generateNextPage(
          pageInfo.endCursor,
          pageInfo.hasNextPage,
          data.fetchMore,
        ),
      }),
      data,
    )
  })
}
