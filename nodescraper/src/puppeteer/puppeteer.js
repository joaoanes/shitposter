const { chunk, flatten } = require('lodash')
const { get } = require('axios')

const { getLastKnownPost, insertPosts, getPostsByStatus, updatePostsStatus, postsPerStatus, updateEventPosts, listEvents } = require('./db')
const { executeInChunks, executeInSequence } = require('../common/junkyard')
const { invokeLambda } = require('./invoke')
const { getPostUrls } = require('../common/s3')
const { submitEvent, puppeteerEvent } = require('../common/log')
const { submit } = require('./submitter')

const getStats = async (scraperNames) => ({
  scrapers: scraperNames,
  posts: await postsPerStatus(scraperNames),
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

const performEvent = async (eventId, ignoreInit, ignoreSubmit, scraperName) => {
  if (!ignoreInit) {
    const initPosts = await loadNewSubmissions(scraperName)

    await updateEventPosts(eventId, 'Inited', initPosts)
  }
  if (!ignoreSubmit) await updateEventPosts(eventId, 'Submitted', await uploadSubmissions(scraperName))
}

const updateIndex = async (lastPostId, scraperName) => {
  const { Payload } = await invokeLambda(
    `${scraperName}_updateIndex`,
    {
      lastPostId,
    }
  )
  const { statusCode, body } = JSON.parse(Payload)

  const { lastSeenPostId } = JSON.parse(body)

  if (statusCode !== 200) {
    puppeteerEvent('relambda', 'requeue', { lastSeenPostId, scraperName })
    return updateIndex(lastSeenPostId, scraperName)
  }

  return true
}

const listPostsSince = async (lastPostId, scraperName) => {
  const { StatusCode, Payload } = await invokeLambda(
    `${scraperName}_list`,
    {
      lastPostId,
    }
  )

  if (StatusCode !== 200) {
    throw new Error('unexpected list status!')
  }
  const { dropUrl } = JSON.parse(JSON.parse(Payload).body)

  const dropRequest = await get(`https://shitposter-scraper-multi.s3.eu-central-1.amazonaws.com/${dropUrl}`)

  return dropRequest.data
}

const uploadSubmissions = async (scraperName) => {
  const fetchedPostIds = (await getPostsByStatus('fetched')).map(({ id }) => id)
  puppeteerEvent('upload', 'load')

  const fetchedPostIdsChunks = chunk(fetchedPostIds, 3000)

  return executeInSequence(
    fetchedPostIdsChunks.map((postIds) => async () => {
      const urls = await executeInChunks(
        postIds.map((postId) => () => getPostUrls(postId, scraperName)),
        Number.MAX_SAFE_INTEGER,
        20,
      )

      puppeteerEvent('upload', 'loaded', { urls: urls.length })

      const presentUrls = urls.filter((post) => post ? post[0].length > 0 : false)

      puppeteerEvent('upload', 'filtered', { urls: presentUrls.length })

      const chunks = chunk(presentUrls, 200)

      puppeteerEvent('upload', 'start', { urls: presentUrls.length })

      const results = await Promise.all(
        chunks.map(async (urls) => {
          const { StatusCode, Payload } = await invokeLambda(
            'sanitizer',
            {
              urls,
            }
          )

          if (StatusCode !== 200) {
            throw new Error('unexpected list status!')
          }
          const { urls: sanitizedUrls } = JSON.parse(JSON.parse(Payload).body)
          puppeteerEvent('upload', 'sanitizer-return', { urls: sanitizedUrls.length })
          return sanitizedUrls
        })
      )

      const flattenedResults = flatten(results)

      // TODO: Check for dupes!

      await executeInChunks(
        flattenedResults.map(([url, { ratingIds, urlDate, internalPostId }]) => async () => {
          submitEvent('execute', 'start', { url, ratingIds, urlDate, internalPostId })
          const res = await submit(url, ratingIds, urlDate, internalPostId).catch(e => e)
          submitEvent('execute', 'finish', { url, res })
        }),
        Number.MAX_SAFE_INTEGER,
        20,
      )
      await updatePostsStatus(postIds.map(postId => ({ postId })), 'submitted')
      return postIds
    }))
}

const loadNewSubmissions = async (scraperName) => {
  console.warn('starto')

  const lastKnownPostId = await getLastKnownPost()
  console.warn('last known post', lastKnownPostId)
  console.warn('updating index')
  await updateIndex(lastKnownPostId, scraperName)
  console.warn('index updated')

  const posts = await listPostsSince(lastKnownPostId, scraperName)
  console.warn('got posts', posts.length)
  await insertPosts(posts)
  console.warn('uploaded posts')

  return posts
}

module.exports = {
  getStats,
  performEvent,
}
