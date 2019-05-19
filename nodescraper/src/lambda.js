const { get } = require('lodash')

const { list, fetch, IndexReconstructionStopped, ensureIndexUpdated } = require('./nextLmaoScraper')
const { threadEvent, lambdaEvent } = require('./log')

const apiGatewayResponse = (body, statusCode = 200) => {
  const resBody = ({
    'isBase64Encoded': false,
    statusCode,
    'headers': {},
    'body': JSON.stringify(body),
  })

  lambdaEvent('response', 'finish', resBody)
  return resBody
}

const newList = async (event) => {
  threadEvent('list', 'begin', { event })

  return apiGatewayResponse({
    posts: await list(
      get(event, 'lastPostId', null),
    ),
  })
}

const newFetch = async (event) => {
  threadEvent('fetch', 'begin', { event })

  const posts = await fetch(
    get(event, 'lastPostId', null),
    get(event, 'posts', undefined)
  )
  threadEvent('fetch', 'end', { event })

  return apiGatewayResponse({
    posts,
  })
}

const updateIndex = async (event) => {
  threadEvent('updateIndex', 'begin', { event })
  try {
    const posts = await ensureIndexUpdated(
      get(event, 'lastPostId', null)
    )
    threadEvent('updateIndex', 'end', { event })
    return apiGatewayResponse({ posts: posts })
  } catch (e) {
    if (e instanceof IndexReconstructionStopped) {
      return apiGatewayResponse({ lastSeenPostId: e.lastSeenPost }, 503)
    } else {
      throw e
    }
  }
}

exports.list = newList
exports.fetch = newFetch
exports.updateIndex = updateIndex
