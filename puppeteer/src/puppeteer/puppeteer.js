const { get } = require('axios')

const { getLastKnownPosts, getLastKnownPost, insertPosts, postsPerStatus, updateEventPosts, listEvents } = require('./db')
const { invokeLambda } = require('./invoke')
const { puppeteerEvent } = require('../common/log')

const getStats = async (scraperNames) => ({
  scrapers: scraperNames,
  posts: await postsPerStatus(scraperNames),
  lastKnownId: await getLastKnownPosts(scraperNames),
  events: (await listEvents()).map(({ id, postsInited, postsSubmitted, postsFetched, createdAt, updatedAt }) => ({
    id,
    // TODO decide what to do with this
    // postsInited: postsInited ? postsInited.length : 0,
    // postsFetched: postsFetched ? postsFetched.length : 0,
    // postsSubmitted: postsSubmitted ? postsSubmitted.length : 0,
    createdAt,
    updatedAt,
  })),
})

const performEvent = async (eventId, scraperName) => {
  const initPosts = await loadNewSubmissions(scraperName)

  await updateEventPosts(eventId, 'Inited', initPosts)
}

const updateIndex = async (lastPostId, scraperName) => {
  try {
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
  } catch (e) {
    puppeteerEvent('relambda', 'requeue', { error: e.toString(), scraperName })
    return updateIndex(lastPostId, scraperName)
  }
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

const loadNewSubmissions = async (scraperName) => {
  console.warn('starto')

  const lastKnownPostId = await getLastKnownPost(scraperName)
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
