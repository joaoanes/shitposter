const { partition, map, maxBy, filter } = require('lodash')
const { flow, reduce, groupBy, map: mapFP } = require('lodash/fp')

const { fetchThreads, parsePosts } = require('./internals')
const { getAllPosts, getPostUrls, getPostRaw, uploadUrls, addToPhonebook } = require('../s3')
const { threadIdToInteger, executeInChunks } = require('../junkyard')
const { extractPostFromPostId, extractThreadFromPostId, parsePostsAndUpload } = require('./facepunchJunkyard')
const { lambdaEvent } = require('../log')

class IndexReconstructionStopped extends Error {
  constructor (post) {
    super('Index reconstruction stopped!')
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.lastSeenPost = post
  }
}

const updateIndex = async (lastSeenPostId, allThreads) => {
  const lastSeenThreadId = extractThreadFromPostId(lastSeenPostId)

  const newThreads = filter(
    allThreads.sort((a, b) => threadIdToInteger(a) - threadIdToInteger(b)),
    (id) => threadIdToInteger(id) >= threadIdToInteger(lastSeenThreadId),
  )

  lambdaEvent('update-index', 'start', { newThreads, allThreads, lastSeenThreadId })

  const results = await fetchThreads(
    newThreads,
    parsePostsAndUpload,
    (new Date()).getTime() + 800000, // 14 mins
  )

  const { stopped: outOfTime, ...fetchResults } = results
  const posts = Object.values(fetchResults)

  await addToPhonebook(posts)

  return { posts, outOfTime }
}

const postsNewerThan = async (lastPostId) => {
  const allPosts = await getAllPosts()
  const lastSeenPostId = extractPostFromPostId(lastPostId)

  return filter(allPosts, (postId) => extractPostFromPostId(postId) > lastSeenPostId)
}

const ensureIndexUpdated = async (lastSeenPostId, allThreads) => {
  const { outOfTime, posts } = await updateIndex(lastSeenPostId, allThreads)
  if (outOfTime) {
    throw new IndexReconstructionStopped(
      maxBy(posts, extractPostFromPostId)
    )
  }

  return posts
}

const fetch = async (lastPostId, posts) => {
  const postsToFetch = posts || (await postsNewerThan(lastPostId))
  const rawPosts = await executeInChunks(
    postsToFetch.map(post => () => getPostUrls(post).then(results => ({ postId: post, results }))),
    (new Date()).getTime() + 720000, // 12mins
    400,
  )

  const [withoutResults, withResults] = partition(rawPosts, ({ results }) => results === null)

  const fetchedResults = await Promise.all(
    withoutResults
      .map(({ postId }) => getPostRaw(postId).then(res => ({ [postId]: res })))
  )
    .then(reduce((acc, val) => ({ ...acc, ...val }), {}))
    .then(async (rawPosts) => {
      const res = await parsePosts(map(
        rawPosts,
        (originalPost, postId) => ({ ...originalPost, internalPostId: postId })
      ))

      const group = flow(
        groupBy(([_res, { internalPostId }]) => internalPostId),
        mapFP.convert({ cap: false })((v, k) => ({ postId: k, results: v[0] }))
      )(res)

      await uploadUrls()(group)

      return group
    })

  const allResults = [
    ...withResults,
    ...fetchedResults,
  ]

  return allResults
}

module.exports = {
  fetch,
  list: postsNewerThan,
  ensureIndexUpdated,
  IndexReconstructionStopped,
}
