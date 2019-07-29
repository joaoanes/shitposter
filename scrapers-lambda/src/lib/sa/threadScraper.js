const { partition, map, filter, last } = require('lodash')
const { flow, reduce, groupBy, map: mapFP } = require('lodash/fp')

const { fetchThreads, parsePosts, extractPostIds } = require('./internals')
const { getAllPosts, getPostUrls, getPostRaw, uploadUrls, addToPhonebook } = require('../s3')
const { executeInChunks, executeInSequence } = require('../junkyard')
const { extractPostFromPostId, extractThreadFromPostId, parsePostsAndUpload } = require('./junkyard')
const { lambdaEvent } = require('../log')
const { sendMessage } = require('../sqs')
const { updateIndex } = require('./updateIndex')

const { NEXT_SQS_URL } = process.env

class IndexReconstructionStopped extends Error {
  constructor (post) {
    super('Index reconstruction stopped!')
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.lastSeenPost = post
  }
}

// const updateIndex = async (lastSeenPostId, allThreads) => {
//   const lastSeenThreadId = extractThreadFromPostId(lastSeenPostId)

//   const newThreads = filter(
//     map(allThreads, (id) => Number.parseInt(id)).sort((a, b) => a > b),
//     (id) => id >= lastSeenThreadId,
//   )

//   lambdaEvent('update-index', 'start', { newThreads, allThreads, lastSeenThreadId })

//   const results = await fetchThreads(
//     newThreads,
//     parsePostsAndUpload,
//     (new Date()).getTime() + 810000, // 13.5 mins,
//   )

//   const { stopped: outOfTime, ...fetchResults } = results
//   const postIds = Object.values(fetchResults)

//   await addToPhonebook(postIds)

//   return { postIds, outOfTime }
// }

const postsNewerThan = async (lastPostId) => {
  const allPosts = await getAllPosts()
  const lastSeenPostId = extractPostFromPostId(lastPostId)

  return filter(allPosts, (postId) => extractPostFromPostId(postId) > lastSeenPostId)
}

const listAndProcess = async (lastPostId) => {
  const postIds = await postsNewerThan(lastPostId)
  await executeInChunks(
    postIds.map((postId) => () => sendMessage(NEXT_SQS_URL, { postId })),
    null,
    50
  )

  return postIds
}

// TODO: lastSeenPostId: useful?
const ensureIndexUpdated = async (lastSeenPostId, allThreads) => {
  const { outOfTime, postIds } = await updateIndex(allThreads)

  if (outOfTime) {
    throw new IndexReconstructionStopped(
      last(postIds)
    )
  }

  return postIds
}

const parse = (posts) => {

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
  list: listAndProcess,
  ensureIndexUpdated,
  IndexReconstructionStopped,
  parse,
}
