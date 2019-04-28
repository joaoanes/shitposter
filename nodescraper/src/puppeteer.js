const { chunk } = require('lodash')

const { getLastKnownPost, insertPosts, getPostsByStatus, updatePostsStatus, postsPerStatus, updateEventPosts, listEvents } = require('./db')
const { invokeLambda } = require('./invoke')
const { executeInChunks } = require('./junkyard')
const { getPostUrls } = require('./upload')
const { submitEvent, puppeteerEvent } = require('./log')
const { sanitize } = require('./sanitizer')
const { submit } = require('./submitter')

const getStats = async () => ({
  posts: await postsPerStatus(),
  lastKnownId: await getLastKnownPost(),
  events: (await listEvents()).map(({ id, postsInited, postsSubmitted, postsFetched, createdAt, updatedAt }) => ({
    id,
    postsInited: postsInited ? postsInited.length : 0,
    postsFetched: postsFetched ? postsFetched.length : 0,
    postsSubmitted: postsSubmitted ? postsSubmitted.length : 0,
    createdAt,
    updatedAt,
  })),
})

const performEvent = async (eventId, ignoreInit, ignoreFetch, ignoreSubmit) => {
  if (!ignoreInit) {
    const initPosts = await loadNewSubmissions()

    await updateEventPosts(eventId, 'Inited', initPosts)
  }
  if (!ignoreFetch) await updateEventPosts(eventId, 'Fetched', await fetchSubmissions())
  if (!ignoreSubmit) await updateEventPosts(eventId, 'Submitted', await uploadSubmissions())
}

const updateIndex = async (lastPostId) => {
  let { Payload } = await invokeLambda(
    'lmaoscraper_updateIndex',
    {
      lastPostId,
    }
  )
  const { statusCode, body } = JSON.parse(Payload)

  const { lastSeenPostId } = JSON.parse(body)

  if (statusCode === 503) {
    puppeteerEvent('relambda', 'requeue', { lastSeenPostId })
    return updateIndex(lastSeenPostId)
  }

  return true
}

const listPostsSince = async (lastPostId) => {
  let { StatusCode, Payload } = await invokeLambda(
    'lmaoscraper_list',
    {
      lastPostId,
    }
  )

  debugger

  if (StatusCode !== 200) {
    // debugger
    throw new Error('unexpected list status!')
  }
  return JSON.parse(JSON.parse(Payload).body)
}

const uploadSubmissions = async () => {
  const seenPostIds = (await getPostsByStatus('fetched')).map(({ id }) => id)
  const urls = await executeInChunks(
    seenPostIds.map((postId) => () => getPostUrls(postId)),
    Number.MAX_SAFE_INTEGER,
    500,
  )

  const sanitizedUrls = await sanitize(urls)

  // TODO: Check dupes!

  await executeInChunks(
    sanitizedUrls.map(([url, { ratingIds, urlDate }]) => async () => {
      submitEvent('execute', 'start', { url, ratingIds, urlDate })
      const res = await submit(url, ratingIds, urlDate).catch(e => e)
      submitEvent('execute', 'finish', { url, res })
    }),
    Number.MAX_SAFE_INTEGER,
    20,
  )
  await updatePostsStatus(seenPostIds.map(postId => ({ postId })), 'submitted')
  return seenPostIds
}

const fetchSubmissions = async () => {
  const seenPostIds = (await getPostsByStatus('seen')).map(({ id }) => id)
  const chunks = chunk(seenPostIds, 20000)
  const invocations = await Promise.all(
    chunks.map(chunk => invokeLambda(
      'lmaoscraper_fetch',
      {
        posts: chunk,
      }
    ))
  )

  const results = invocations.reduce(
    (acc, { Payload, StatusCode }) => {
      if (StatusCode !== 200) {
        throw new Error('Weird status at invoke!')
      }
      return [...acc, ...(JSON.parse(JSON.parse(Payload).body).posts)]
    },
    []
  )

  debugger

  await updatePostsStatus(results, 'fetched')
  return results
}

const loadNewSubmissions = async () => {
  console.warn('starto')
  // debugger
  const lastKnownPostId = await getLastKnownPost()
  console.warn('last known post', lastKnownPostId)
  console.warn('updating index')
  await updateIndex(lastKnownPostId)
  console.warn('index updated')

  const { posts } = await listPostsSince(lastKnownPostId)
  console.warn('got posts')
  await insertPosts(posts)
  console.warn('uploaded posts')

  return posts
}

module.exports = {
  getStats,
  performEvent,
}
