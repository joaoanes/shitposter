const { GraphQLClient } = require('graphql-request')
const { reduce } = require('lodash')

const URL = process.env['SHITPOSTER_GRAPHQL_URL']
const TOKEN = process.env['SHITPOSTER_GRAPHQL_TOKEN']

const graphQLClient = new GraphQLClient(
  URL,
  {
    headers: {
      authorization: `Bearer ${TOKEN}`,
    },
  },
)

const submit = async (url, ratings, urlDate) => {
  if (!URL || !TOKEN) {
    throw new Error('missing URL or token')
  }

  const query = `
  mutation addPost($name : String, $url : String!, $sourceId: Int!, $urlDate: String, $reactions: [ReactionInput] ) {
    addShitpostAdv(name: $name, url: $url, sourceId:$sourceId, reactions:$reactions, urlDate:$urlDate) {
      id
    }
  }
  `

  const variables = {
    url,
    sourceId: 1,
    reactions: reduce(ratings, (acc, count, id) => (
      [...acc, ...(new Array(count).fill(id))]
    ), []),
    urlDate: urlDate,
  }

  return Promise.race([
    graphQLClient.request(query, variables).catch(e => { console.error(e); return e }),
    new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error('Timeout!')), 3000)
    }),
  ])
}

module.exports = {
  submit: submit,
}
