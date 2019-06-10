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

const extractThreadFromPostId = (postId) => {
  let id = null
  try {
    id = postId.match('(?<threadId>.*)-(?<postId>.*)').groups.threadId
  } catch (e) {
    return ''
  }

  return id
}

const submit = async (url, ratings, urlDate, internalId) => {
  if (!URL || !TOKEN) {
    throw new Error('missing URL or token')
  }

  const query = `
  mutation addPost($name : String, $url : String!, $sourceId: Int!, $urlDate: String, $sourceLink: String, $reactions: [ReactionInput] ) {
    addShitpostAdv(name: $name, url: $url, sourceId:$sourceId, reactions:$reactions, urlDate:$urlDate) {
      id
    }
  }
  `

  const variables = {
    url,
    sourceId: 1,
    sourceLink: `https://forum.facepunch.com/thread/${extractThreadFromPostId(internalId)}`,
    reactions: reduce(ratings, (acc, count, id) => (
      [...acc, ...(new Array(count).fill(id))]
    ), []).map(ratingId => ({ ratingId: Number.parseInt(ratingId) })),
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
