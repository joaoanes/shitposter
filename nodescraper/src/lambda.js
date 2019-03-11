const { flatten, get } = require('lodash')
const ProgressBar = require('progress')

const { parse, fetch } = require('./lmaoscraper')
const { submit } = require('./submitter')
const { executeInChunks } = require('./junkyard')
const { threadEvent } = require('./log')
const { uploadThreadPosts, loadFromS3, uploadPosts } = require('./upload')

const apiGatewayResponse = (body) => ({
  'isBase64Encoded': false,
  'statusCode': 200,
  'headers': {},
  'body': JSON.stringify(body),
})

const submitPosts = async (event, context, callback) => {
  threadEvent('parsing', 'begin')
  const posts = await loadFromS3(`${event.id}/urls.json`)

  const normalizedUrls = flatten(
    posts.map(([urls, meta]) => urls.map(url => [url, meta]))
  )

  const bar = new ProgressBar('submitting [:bar] :current/:total :percent :etas', { total: normalizedUrls.length })
  bar.tick()

  const submitThunks = normalizedUrls.map(([url, { ratingIds, urlDate }]) => () => (
    submit(url, ratingIds, urlDate)
      .catch((e) => console.error(e))
      .then(() => bar.tick())
  ))

  await executeInChunks(
    submitThunks,
    (new Date()).getTime() + 900000,
    40
  )

  return apiGatewayResponse({})
}

const parseThreads = async (event) => {
  threadEvent('parsing', 'begin')
  const threads = get(event, 'multiValueQueryStringParameters.threads', null)

  const threadPosts = flatten(
    await Promise.all(
      threads.map((threadId) => loadFromS3(`${event.id}/threads/${threadId}.json`))
    )
  )

  const results = await parse(
    threadPosts,
  )

  await uploadPosts(event)(results)

  threadEvent('parsing', 'end')

  return apiGatewayResponse({ postCount: results.length })
}

const fetchThreads = async (event) => {
  threadEvent('fetching', 'begin')
  const threads = get(event, 'multiValueQueryStringParameters.threads', null)

  const results = await fetch(
    threads,
    uploadThreadPosts(event),
  )

  threadEvent('fetching', 'end')

  return apiGatewayResponse({ threads: Object.keys(results) })
}

const all = async (event) => {
  const threads = get(event, 'multiValueQueryStringParameters.threads', null)

  const threadRawPosts = await fetch(
    threads,
    async (e) => e
  )

  const posts = await parse(
    flatten(
      Object.values(
        threadRawPosts,
      )
    )
  )

  const normalizedUrls = flatten(
    posts.map(([urls, meta]) => urls.map(url => [url, meta]))
  )

  const bar = new ProgressBar('submitting [:bar] :current/:total :percent :etas', { total: normalizedUrls.length })
  bar.tick()

  const submitThunks = normalizedUrls.map(([url, { ratingIds, urlDate }]) => () => (
    submit(url, ratingIds, urlDate)
      .catch((e) => console.error(e))
      .then(() => bar.tick())
  ))

  await executeInChunks(
    submitThunks,
    (new Date()).getTime() + 900000,
    40
  )

  return apiGatewayResponse({})
}

exports.parse = parseThreads
exports.submit = submitPosts
exports.fetch = fetchThreads
exports.all = all
