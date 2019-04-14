const { chunk, uniqBy, flatten } = require('lodash')
const { v4 } = require('uuid')

const { getLastKnownPost, insertPosts, getPostsByStatus, updatePostsStatus, postsPerStatus, createEvent, updateEventPosts, listEvents } = require('./db')
const { invokeLambda } = require('./invoke')
const { executeInChunks } = require('./junkyard')
const { getPostUrls } = require('./upload')
const { submit } = require('./submitter')
const { submitEvent } = require('./log')

const getStats = async () => ({
  posts: await postsPerStatus(),
  lastKnownId: await getLastKnownPost(),
  events: await listEvents(),
})

const performEvent = async (ignoreInit, ignoreFetch, ignoreSubmit) => {
  const eventId = v4()
  await createEvent(eventId)

  if (!ignoreInit) await updateEventPosts(eventId, 'Inited', await loadNewSubmissions())
  if (!ignoreFetch) await updateEventPosts(eventId, 'Fetched', await fetchSubmissions())
  if (!ignoreSubmit) await updateEventPosts(eventId, 'Submitted', await uploadSubmissions())
}

const updateIndex = async (lastPostId) => {
  let { StatusCode, Payload } = await invokeLambda(
    'lmaoscraper_updateIndex',
    {
      lastPostId,
    }
  )

  if (StatusCode === 503) {
    await updateIndex(JSON.parse(Payload).lastPostId)
    // TODO: add logging
    return lastPostId
  }
}

const listPostsSince = async (lastPostId) => {
  let { StatusCode, Payload } = await invokeLambda(
    'lmaoscraper_list',
    {
      lastPostId,
    }
  )

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

  const urlsWithContent = urls.filter(([content, meta]) => content.length !== 0)
  const unfurledUrls = flatten(urlsWithContent.map(([content, meta]) => content.map(url => [url, meta])))
  const sanitizedUrls = uniqBy(unfurledUrls, ([content, meta]) => content)

  // TODO: Check dupes!

  await executeInChunks(
    sanitizedUrls.map(([url, { ratingIds, urlDate }]) => async () => {
      submitEvent('execute', 'start', { url })
      const res = await submit(url, ratingIds, urlDate).catch(e => e)
      submitEvent('execute', 'finish', { url, res })
    }),
    Number.MAX_SAFE_INTEGER,
    20,
  )

  return updatePostsStatus(seenPostIds.map(postId => ({ postId })), 'submitted')
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

  return updatePostsStatus(results, 'fetched')
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
  const insertedPosts = await insertPosts(posts)
  console.warn('uploaded posts')

  debugger

  console.warn(insertedPosts.length)
  return insertedPosts
}

module.exports = {
  getStats,
  performEvent,
}
