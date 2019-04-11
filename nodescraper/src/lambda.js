const { get } = require('lodash')

const { list, fetch, IndexReconstructionStopped, ensureIndexUpdated } = require('./nextLmaoScraper')
const { threadEvent } = require('./log')

const apiGatewayResponse = (body, statusCode = 200) => ({
  'isBase64Encoded': false,
  statusCode,
  'headers': {},
  'body': JSON.stringify(body),
})

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
    await ensureIndexUpdated(
      get(event, 'lastPostId', null)
    )
    threadEvent('updateIndex', 'end', { event })
    return apiGatewayResponse()
  } catch (e) {
    if (e instanceof IndexReconstructionStopped) {
      return apiGatewayResponse({ lastSeen: e.lastSeenPost }, 503)
    } else {
      throw e
    }
  }
}

exports.list = newList
exports.fetch = newFetch
exports.updateIndex = updateIndex
