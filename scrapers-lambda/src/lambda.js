const { get } = require('lodash')
const { config } = require('dotenv')

config()

const { SCRAPER_NAME = 'lmaoscraper' } = process.env

const { list, fetch, IndexReconstructionStopped, ensureIndexUpdated } = require('./lib/sa/threadScraper')
const { parse } = require('./lib/sa/parser')

const { threadEvent, lambdaEvent } = require('./lib/log')
const { dropFileToS3 } = require('./lib/s3')
const { sanitize: doSanitize } = require('./lib/sanitizerLambda')

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
  const posts = await list(
    get(event, 'lastPostId', null),
  )

  threadEvent('list', 'drop-start', { event })
  const dropUrl = await dropFileToS3(posts)
  threadEvent('list', 'drop-end', { event, dropUrl })

  threadEvent('list', 'end', { event, posts: posts.length })

  return apiGatewayResponse({
    drop: true,
    dropUrl,
  })
}

const newFetch = async (event) => {
  threadEvent('fetch', 'begin', { event })

  const posts = await fetch(
    get(event, 'lastPostId', null),
    get(event, 'posts', undefined),
  )
  threadEvent('fetch', 'end', { event })

  return apiGatewayResponse({
    posts,
  })
}

const updateIndex = async (event) => {
  const { getThreads } = require(`./${SCRAPER_NAME}/getThreads`)
  threadEvent('updateIndex', 'begin', { event })
  try {
    const allThreads = await getThreads()

    const posts = await ensureIndexUpdated(
      get(event, 'lastPostId', null),
      allThreads
    )
    threadEvent('updateIndex', 'end', { event })
    return apiGatewayResponse({ postIds: posts.length })
  } catch (e) {
    if (e instanceof IndexReconstructionStopped) {
      return apiGatewayResponse({ lastSeenPostId: e.lastSeenPost }, 503)
    } else {
      threadEvent('updateIndex', 'error', { error: e.toString() })
      apiGatewayResponse({ error: e.toString() }, 500)
    }
  }
}

const sanitize = async (event) => {
  threadEvent('sanitize', 'begin', { event })
  const urls = await doSanitize(
    get(event, 'urls', null)
  )
  threadEvent('sanitize', 'end', { event, urls: urls.length })
  return apiGatewayResponse({ urls })
}

const newParse = async (event) => {
  threadEvent('parse', 'begin', { event })
  const urls = await parse(
    get(event, 'Records', null)
  )
  threadEvent('parse', 'end', { event, urls: urls.length })
  return apiGatewayResponse({ urls })
}

exports.list = newList
exports.fetch = newFetch
exports.updateIndex = updateIndex
exports.sanitize = sanitize
exports.parse = newParse
