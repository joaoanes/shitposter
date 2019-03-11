const { GraphQLClient } = require('graphql-request')

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
  const query = /* GraphQL */ `
  mutation addPost($name : String, $url : String!, $sourceId: Int!, $urlDate: String, $reactions: [ReactionInput] ) {
    addShitpostAdv(name: $name, url: $url, sourceId:$sourceId, reactions:$reactions, urlDate:$urlDate) {
      id
    }
  }
  `

  const variables = {
    url,
    sourceId: 1,
    reactions: ratings.map(r => ({ ratingId: r })),
    urlDate: urlDate,
  }

  return Promise.race([
    graphQLClient.request(query, variables),
    new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error('Timeout!')), 3000)
    }),
  ])
}

module.exports = {
  submit: submit,
}
